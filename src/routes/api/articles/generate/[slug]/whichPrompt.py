import wikipediaapi
import sys

wiki_wiki = wikipediaapi.Wikipedia(
    user_agent='searchupInfo',
        language='en',
        extract_format=wikipediaapi.ExtractFormat.WIKI
)

topic = str(sys.argv[1])
p_wiki = wiki_wiki.page(topic.replace(" ", "_"))

if(p_wiki.exists()):
    if(("may refer to:") in p_wiki.summary):
        sys.stdout.write(str(2))
    else:
        sys.stdout.write(str(1))
else:
    sys.stdout.write(str(0))

print("BAD STUFF")
sys.stdout.flush()