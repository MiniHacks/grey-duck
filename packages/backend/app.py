from fastapi import FastAPI
import openai
import os

openai.api_key = os.getenv("OPENAI_API_KEY")
app = FastAPI()


def count_tokens(s):
    return len(s) // 4


@app.get("/")
async def root():
    return {"message": "Hello World"}


@app.get("/example")
async def example():
    old = """def solution(rectangles):
        points = set()
        for x1, y1, x2, y2 in rectangles:
            for x in range(x1, x2):
                for y in range(y1, y2):
                    points.add((x, y))
        return len(points)"""
    new = improve_code(old)
    exp = explain_change(old, new)
    return {"improved_code": new, "explanation": exp}


def improve_code(code):
    query_string = f"""rewrite the function elegantly

    {code}
    """
    result = openai.Completion.create(
        model="text-davinci-002",
        prompt=query_string,
        max_tokens=count_tokens(query_string),
        temperature=0,
        stop=["---", '"""'],
    )
    return result["choices"][0]["text"]


def explain_change(initial_code, new_code):
    query_string = f"""{initial_code}

    {new_code}

    The new code is elegant because """
    result = openai.Completion.create(
        model="text-davinci-002",
        prompt=query_string,
        max_tokens=64,
        temperature=0,
        stop=["---", '"""', "\n\n"],
    )
    generated_text = result["choices"][0]["text"]
    return "\n".join([x.strip().capitalize() for x in generated_text.split("\n")])
