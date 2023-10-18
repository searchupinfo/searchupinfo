import re
import google.generativeai as palm
import sys

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


model = "models/text-bison-001"

parameters = {
    "temperature": 0.1,
    "max_output_tokens": 2000,
    "top_p": 0.8,
    "top_k": 10,
}

prompt = f"Write a 2 medium paragraph summary about {topic}. Do not write any titles or subtitles. Write  ** around a few words that should be linked to wikipedia articles."

response = palm.generate_text(
    model=model,
    prompt=prompt,
    **parameters,
    safety_settings=[
        {"category": "HARM_CATEGORY_DEROGATORY", "threshold": "BLOCK_ONLY_HIGH"},
        {"category": "HARM_CATEGORY_TOXICITY", "threshold": "BLOCK_ONLY_HIGH"},
        {"category": "HARM_CATEGORY_VIOLENCE", "threshold": "BLOCK_ONLY_HIGH"},
        {"category": "HARM_CATEGORY_SEXUAL", "threshold": "BLOCK_ONLY_HIGH"},
        {"category": "HARM_CATEGORY_MEDICAL", "threshold": "BLOCK_ONLY_HIGH"},
        {"category": "HARM_CATEGORY_DANGEROUS", "threshold": "BLOCK_ONLY_HIGH"},
    ],
)
sys.stdout.write(f" # {topic.title()}")
sys.stdout.write("\n")
sys.stdout.write(fixText(response.result))

prompt = f"Return a valid yaml list with at most 20 elements for the section names of a wikipedia article about {topic}. Do not format it as markdown. Do not include an introduction. DO NOT start with \`\`\`, include markdown, or include a {topic} section."

parameters = {
    "temperature": 0.3,
    "max_output_tokens": 2000,
    "top_p": 0.8,
    "top_k": 10,
}

response = palm.generate_text(
    model=model,
    prompt=prompt,
    **parameters,
    safety_settings=[
        {"category": "HARM_CATEGORY_DEROGATORY", "threshold": "BLOCK_ONLY_HIGH"},
        {"category": "HARM_CATEGORY_TOXICITY", "threshold": "BLOCK_ONLY_HIGH"},
        {"category": "HARM_CATEGORY_VIOLENCE", "threshold": "BLOCK_ONLY_HIGH"},
        {"category": "HARM_CATEGORY_SEXUAL", "threshold": "BLOCK_ONLY_HIGH"},
        {"category": "HARM_CATEGORY_MEDICAL", "threshold": "BLOCK_ONLY_HIGH"},
        {"category": "HARM_CATEGORY_DANGEROUS", "threshold": "BLOCK_ONLY_HIGH"},
    ],
)

lst = response.result
if (len(lst)) > 2:
    lst = lst.split("\n")[1:-1]
    lst = [el[2:] for el in lst]

parameters = {
    "temperature": 0.1,
    "max_output_tokens": 2000,
    "top_p": 0.8,
    "top_k": 10,
}

for section in lst:
    prompt = f"Write the {section} section of a wikipedia article about {topic}. Do not include the title of the section or links inside of the text. Write  ** around a few words or topics that should be linked to wikipedia articles."
    response = palm.generate_text(
        model=model,
        prompt=prompt,
        **parameters,
        safety_settings=[
            {"category": "HARM_CATEGORY_DEROGATORY", "threshold": "BLOCK_ONLY_HIGH"},
            {"category": "HARM_CATEGORY_TOXICITY", "threshold": "BLOCK_ONLY_HIGH"},
            {"category": "HARM_CATEGORY_VIOLENCE", "threshold": "BLOCK_ONLY_HIGH"},
            {"category": "HARM_CATEGORY_SEXUAL", "threshold": "BLOCK_ONLY_HIGH"},
            {"category": "HARM_CATEGORY_MEDICAL", "threshold": "BLOCK_ONLY_HIGH"},
            {"category": "HARM_CATEGORY_DANGEROUS", "threshold": "BLOCK_ONLY_HIGH"},
        ],
    )
    if len(fixText(response.result)) < 40:
        continue
    sys.stdout.write(f"\n ## {section}\n")
    sys.stdout.write(removeDupes(section, fixText(response.result)).replace("# ", "## "))


sys.stdout.write(1)
sys.stdout.flush()