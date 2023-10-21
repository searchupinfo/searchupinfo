import re
import google.generativeai as palm
import sys
import wikipediaapi

palm.configure(api_key=sys.argv[1])
topic = sys.argv[2]


def fixSections(text):
    text = str(text)
    pattern = r"Section: (.*?)(\(\d+\)):"
    result = re.sub(
        pattern, lambda match: "#" * int(match.group(2)[1:-1]) + match.group(1), text
    )
    result = re.sub(r"Subsections \(.+\):", "", result)
    return result


def ensure_hash_space(text):
    pattern = r"#+"
    matches = re.finditer(pattern, text)
    c = 0
    for match in matches:
        text = text[: match.start() + c] + match.group() + " " + text[match.end() + c :]
        c += 1
    return text


def stars(text, max_length=32):
    pattern = r"\*\*([^\*]+)\*\*"
    matches = re.finditer(pattern, text)
    for match in matches:
        if len(match.group()) > (max_length + 4):
            text = text.replace(match.group(), match.group()[2:-2])
        elif (
            len(match.group()) < 8
            or match.group() == "** and **"
            or match.group() == "**, and **"
        ):
            text = text.replace(match.group(), match.group()[2:-2])
        else:
            out = match.group().replace(" ", "%20").replace("\n", "")
            r = match.group()[2:-2].replace("\n", "").replace(">", "")
            text = text.replace(
                match.group(),
                f"[{r}](https://searchup.info/articles/{out[2:-2]})",
            )
    new_string = ""
    for i in range(len(text)):
        if text[i] == "[" and text[i - 1] != " ":
            new_string += " "
        new_string += text[i]
    newNew = ""
    for i in range(len(text)):
        if text[i] == "#" and text[i - 1] != "\n":
            newNew += "\n"
        newNew += text[i]
    return newNew


def noWIKI(text):
    matches = re.finditer(r"\[(.*?)\]\((.*?)\)", text)
    for match in matches:
        index = match.group().find("]")
        out2 = match.group()[index:]
        while out2.count("(") > out2.count(")"):
            out2 += ")"
        out2.replace("*", "")
        out2.replace(":", "")
        text = text.replace(
            match.group(), match.group()[:index] + out2.replace(" ", "_")
        )
    # matches = re.finditer(r"\[(.*?)\]\((.*?)", text)
    return text.replace(
        "https://en.wikipedia.org/wiki/", "https://searchup.info/articles/"
    ).replace("Wikipedia ", "SearchUp ")


def fixText(text):
    output = str(text)
    output = ensure_hash_space(output)
    output = output.replace(f"**{topic}**", f"{topic}")
    output = output.replace(f"**{topic.lower}**", f"{topic.lower}")
    output = output.replace("# #", "##")
    output = output.replace("```", "")
    output = stars(output)
    output = noWIKI(output)
    output = output.replace("**", "")
    output[0].upper()
    return output


def outReady(out):
    if out == None:
        return False
    if out == "":
        return False
    if out == " ":
        return False
    if out == "None":
        return False
    if out == "0":
        return False
    if out.__contains__("None") and out.__len__() < 10:
        return False
    return True


def removeDupes(section, txt):
    txt = txt.split("\n")
    if txt[0] == section or txt[0] == " " + section:
        txt = txt[1:]
    if (section + "[") in txt[0]:
        txt[1] = txt[1][len(section) + 1 :]
    return "\n".join(txt)

sys.stdout.write(f" # {topic.title()}")
sys.stdout.write("\n")
model = "models/text-bison-001"

parameters = {
    "temperature": 0.1,
    "max_output_tokens": 2000,
    "top_p": 0.8,
    "top_k": 10,
}

wiki_wiki = wikipediaapi.Wikipedia(
    user_agent='searchupInfo',
        language='en',
        extract_format=wikipediaapi.ExtractFormat.WIKI
)
p_wiki = wiki_wiki.page(topic.replace(" ", "_"))

Allsections = [s for s in p_wiki.sections]


pageContent = p_wiki.summary
prompt = f"Summarize the following article. Do not write any titles or subtitles. Write  ** around words or topics that should be linked to wikipedia articles." + "\n\n" + pageContent

response = palm.generate_text(
    model=model,
    prompt=prompt, 
    **parameters,
    safety_settings=[{ "category": "HARM_CATEGORY_DEROGATORY", "threshold": "BLOCK_ONLY_HIGH" }, { "category": "HARM_CATEGORY_TOXICITY", "threshold": "BLOCK_ONLY_HIGH" }, { "category": "HARM_CATEGORY_VIOLENCE", "threshold": "BLOCK_ONLY_HIGH" }, { "category": "HARM_CATEGORY_SEXUAL", "threshold": "BLOCK_ONLY_HIGH" }, { "category": "HARM_CATEGORY_MEDICAL", "threshold": "BLOCK_ONLY_HIGH" }, { "category": "HARM_CATEGORY_DANGEROUS", "threshold": "BLOCK_ONLY_HIGH" }],
)

out = fixText(response.result)
counter = 0
if(outReady(out)):
    sys.stdout.write(out)
while(not outReady(out) and counter < 3):
    response = palm.generate_text(
        model=model,
        prompt=prompt, 
        **parameters,
    )
    out = fixText(response.result)
    if(outReady(out)):
        sys.stdout.write(out)
        break
    counter += 1
if(not outReady(out)):
    prompt = f"Write a short summary about {topic}. Do not write any titles or subtitles. Write  ** around words or topics that should be linked to wikipedia articles."
    response = palm.generate_text(
        model=model,
        prompt=prompt, 
        **parameters,
    )
    out = fixText(response.result)
    if(outReady(out)):
        sys.stdout.write(out)

    

for section in Allsections:
    if(section == None):
        break
    if(section.title == "See also"):
        break
    if(section.title == "References"):
        break
    if(section.title == "External links"):
        break
    if(section.title == "Further reading"):
        break
    if(section.title == "Notes"):
        break
    if(section.title == "Gallery"):
        break
    pageContent = fixSections(str(section))
    #prompt = f"Summarize the following article. Write  ** around words or topics that should be linked to wikipedia articles. Make sure to use markdown formatting when nessesary and always add a space after a sequence of #. Make sure to add a space after a . if it is at the end of a sentence. Follow proper english grammar rules." + "\n\n" + pageContent
    sys.stdout.write(f"\n\n ## {section.title}\n\n")
    prompt = f"Summarize the following article. Do not write any titles or subtitles. Write  ** around words or topics that should be linked to wikipedia articles." + "\n\n" + pageContent

    response = palm.generate_text(
        model=model,
        prompt=prompt, 
        **parameters,
    )
    out = fixText(response.result)
    if(outReady(out)):
        sys.stdout.write(out)
        continue
    counter = 0
    while(not outReady(out) and counter < 3):
        prompt = f"Summarize the following article. Do not write any titles or subtitles. Write  ** around words or topics that should be linked to wikipedia articles." + "\n\n" + pageContent
        response = palm.generate_text(
            model=model,
            prompt=prompt, 
            **parameters,
        )
        out = fixText(response.result)
        if(outReady(out)):
            sys.stdout.write(fixText(response.result))
            break
        counter += 1
    if(not outReady(out)):
        prompt = f"Write a short article about {section.title} about {topic}. Do not write any titles or subtitles. Write  ** around words or topics that should be linked to wikipedia articles, for example write : ** idea **."
        response = palm.generate_text(
            model=model,
            prompt=prompt, 
            **parameters,
        )
        out = fixText(response.result)
        if(outReady(out)):
            sys.stdout.write(out)
sys.stdout.flush()