### Custom-JSON-Parser
A proof of concept custom JSON parser for my portfolio website

## The Logic:
Based on the railroad/syntax diagrams JSON Syntax. Also known as McKeeman Form:

```
json
  element

value
  object
  array
  string
  number
  "true"
  "false"
  "null"

object
  '{' whitespace '}'
  '{' members '}'

```

# Object Diagram
![object railroad/syntax diagram](https://www.json.org/img/object.png)

# Array Diagram
![array railraod diagram](https://www.json.org/img/array.png)

# Value Diagram
![value railraod diagram](https://www.json.org/img/value.png)

# String diagram
![string diagram](https://www.json.org/img/string.png)

# Number diagram
![Number railroad/syntax diagram](https://www.json.org/img/number.png)

# Whitespace diagram
![ws diagram](https://www.json.org/img/whitespace.png)


# References:
https://www.json.org/json-en.html
https://www.crockford.com/mckeeman.html
https://jsoneditoronline.org/indepth/parse/parse-json/