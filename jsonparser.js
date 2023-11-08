
//------- A proof of Concept JSON parser -------
//--------------By Jacob Biggs------------------
//Based on the railroad/syntax diagrams found at https://www.json.org/


// Conventions:
// parseSomething(): parse the input based on JSON grammar and return a value.
// handleSomething(): handle the characters when there, but not used in final output.
// skipSomething(): ignores when characters are obsolete / could not be there.

const fs = require("fs");
const filepath = "projects.json";

function parseJSON(str){ //Based on https://www.json.org/img/object.png 
    let i = 0; //Resets index to 0

    const value = parseValue();
    expectEndOfInput();
    return value;

    //Parse functions
    function parseObject(){
        if(str[i]==='{'){
            
            i++ //Updates to next iteration
            skipWS(); //skips whitespace 

            const result ={ }; //Initialises result as empty JS object.
            
            
            let firstLoop = true; //Sets true on first loop 
            //if next char is not "}", we go to path of string,WS,:,value...etc
            while (str[i] !=='}' && i<str.length){
                if(!firstLoop){ //Not first loop as only appears before we start second loop.
                    //Handles when new section is added (e.g "key:value, ")
                    handleComma(); 
                    skipWS();
                }

                const key = parseString(); //Parses key names as strings
                if (key === undefined){expectObjectKey();} //Handles object 
                skipWS(); 
                handleColon();
                const value = parseValue(); //Parses value after key

                result[key] = value;

                firstLoop = false; //Resets first loop to false
            }
            expectNotEndOfInput("}") //Checks for early finish
            //move to next character (in this case "}")
            i++;
            return result; //returns result object 
        }
    }

    //Based on diagram found at https://www.json.org/img/array.png
    function parseArray(){
        if (str[i]==='['){
            i++;
            skipWS();
            
            const result = [] //Initialises result as empty JS array.
            let firstLoop = true;
            while (str[i]!==']' && i<str.length){
                if(!firstLoop){
                    handleComma();
                }
                const value = parseValue(); //Parses next value in array
                result.push(value); //Appends value onto result array
                firstLoop = false; //Ensures no longer first loop
            }
            expectNotEndOfInput("]") //checks for early escape
            //move onto next character ("]")
            i++;
            return result;
        }
    }

    //Based on diagram found at https://www.json.org/img/value.png
    function parseValue(){
        //A value starts with "whitespace", 
        skipWS();
        //then any of the following: "string", "number", "object", "array", "true", "false" or "null", and then end with a "whitespace":
        //Attempt to parse value as string, if not try other methods
        
        /*
        let value;
        switch (true) {  //TODO: change to nullish coalescing operator?? maybe??
            case (value = parseString()) !== null:
            break;
            case (value = parseNumber()) !== null:
            break;
            case (value = parseObject()) !== null:
            break;
            case (value = parseArray()) !== null:
            break;
            case (value = parseKeyword('true', true)) !== null:
            break;
            case (value = parseKeyword('false', false)) !== null:
            break;
            case (value = parseKeyword('null', null)) !== null: //These will only not return null when the data is correct, then breaks loop
            break;
            default:
                skipWS(); //final whitespace after value
                return value;
        }  
        */
        
       
        const value =
        parseString() ??
        parseNumber() ??
        parseObject() ??
        parseArray() ??
        parseKeyword("true", true) ??
        parseKeyword("false", false) ??
        parseKeyword("null", null);
        skipWS()
        return value;
        
    }

    //Checks whether current str.slice(i) matches the key string, if so it will return keyword's value.
    function parseKeyword(name,value){ 
        if (str.slice(i,i+ name.length) === name){ 
            i+= name.length;
            return value;
        }
    }

    //Based on diagram found at https://www.json.org/img/string.png
    function parseString(){ 
        if (str[i] === '"') {
            i++;
            let result = "";

            while (str[i] !== '"') {//'"' being end of string
                if(str[i]==="\\"){
                    const char = str[i+1]; //Skips double reverse solidus
                    if (char ==='"' ||
                        char ==="\\"||
                        char ==="/"||
                        char ==="b"|| //backspace
                        char ==="f"|| //formfeed (next page)
                        char ==="n"|| //linefeed
                        char ==="r"|| //carriage return
                        char ==="t" //horizontal tab
                    ){
                        result += char; //add character to result
                        i++; //advance index
                    }
                    //case for \uXXXX (hexidecimal 4 digits)
                    else if (char === "u"){
                        
                        if ( //Checking the hex values are valid following the \u escape
                            isHex(str[i+2]) &&
                            isHex(str[i+3]) &&
                            isHex(str[i+4]) &&
                            isHex(str[i+5]) 
                        ){
                        //Extracts hex code, converts into decimal integer,then into string. finally puts into result variable
                        result += String.fromCharCode(parseInt(str.slice(i+2,i+6),16)); 
                        i+=5; //Updates i to the end of hex code 
                        } else{
                            i+=2;
                            expectEscapeUnicode(result);
                        } 
                    } else{
                        expectEscapeCharacter(result);
                    }
                }
                else{ //If not special case
                    result += str[i] //Append current i to result
                    //i++; //Advance
                }
                i++;
            }
            expectNotEndOfInput('"'); //Checks for incorrect EOS
            i++;
            return result;
        }
    }

    function isHex(char) {
        return (
          (char >= "0" && char <= "9") ||
          (char.toLowerCase() >= "a" && char.toLowerCase() <= "f")
        );
    }
    
    //Based on diagram found at https://www.json.org/img/number.png
    function parseNumber(){
        let initialIndex = i;
        //Check sign, 0s, digits, fractionals then exponents.

        //Whole part 
        if (str[i] === "-"){ //Checks sign for negative
            i++;  //Advances index
            expectDigit(str.slice(initialIndex,i)); //Error checks from start
        }
        if (str[i] === "0"){ //Checks for 0 starting number
            i++; 
        } else if (str[i] >= "1"&& str[i <=9]){ //Checks next index value is within valid range
            i++; 
            while (str[i]>="0"&&str[i]<="9"){ //Continues until end of number or decimal/exponent
                i++;
            }
        }
        
        //Decimal Part
        if (str[i]==="."){ //Checks for decimal point
            i++;
            expectDigit(str.slice(initialIndex,i));
            while (str[i]>="0"&&str[i]<="9"){ //Checks for fractional part after decimal
                i++; //Advances index
            }
        }

        //Exponent part
        if(str[i]==="e" || str[i] ==="E"){ //Checks upper and lowercases
            i++; //Advances onto 

            if (str[i]==="+"||str[i]==="-"){
                i++;
            }
            expectDigit(str.slice(initialIndex,i));
            while (str[i]>="0"&&str[i]<="9"){
                i++
            }
        }
        
        if(i>initialIndex){
            return Number(str.slice(initialIndex,i));
        }
    }
    
    //Handle Functions:
    function handleComma(){
        //if(str[i] !== ','){
            //throw new Error("Invalid Input. Expected ','."); 
        //}
        expectCharacter(",");
        i++;
    }

    function handleColon(){
        //if (str[i] !== ':'){
            //throw new Error("Invalid Input. Expected ':'.")
        //}
        expectCharacter(":");
        i++;
    }

    //Skip functions:
    function skipWS(){
        while (str[i]===" "|| str[i]==="\n"||str[i]==="\t"||str[i]==="\r"){ //Checking for empty space and encoding. 
            i++;
        }
    }

    //Error Handling (doesnt work without):
    function expectNotEndOfInput(expected){
        if (i===str.length){
            printCodeSnippet(`expecting a \`${expected}\` here`);
            throw new Error("JSON_ERROR_0001 Unexpected End of Input");
        }
    }
    function expectEndOfInput() {
        if (i < str.length) {
          printCodeSnippet("expecting to end here");
          throw new Error("JSON_ERROR_0002 expected End of Input");
        }
      }
    
      function expectObjectKey() {
        printCodeSnippet(`expecting object key here
    
    For example:
    { "foo": "bar" }
      ^^^^^`);
        throw new Error("JSON_ERROR_0003 expecting JSON Key");
      }
    
      function expectCharacter(expected) {
        if (str[i] !== expected) {
          printCodeSnippet(`expecting a \`${expected}\` here`);
          throw new Error("JSON_ERROR_0004 Unexpected token");
        }
      }
    
      function expectDigit(numSoFar) {
        if (!(str[i] >= "0" && str[i] <= "9")) {
          printCodeSnippet(`JSON_ERROR_0005 expecting a digit here
    
    For example:
    ${numSoFar}5
    ${" ".repeat(numSoFar.length)}^`);
          throw new Error("JSON_ERROR_0006 expecting a digit");
        }
      }
    
      function expectEscapeCharacter(strSoFar) {
        printCodeSnippet(`JSON_ERROR_0007 expecting escape character
    
    For example:
    "${strSoFar}\\n"
    ${" ".repeat(strSoFar.length + 1)}^^
    List of escape characters are: \\", \\\\, \\/, \\b, \\f, \\n, \\r, \\t, \\u`);
        throw new Error("JSON_ERROR_0008 expecting an escape character");
      }
    
      function expectEscapeUnicode(strSoFar) {
        printCodeSnippet(`expect escape unicode
    
    For example:
    "${strSoFar}\\u0123
    ${" ".repeat(strSoFar.length + 1)}^^^^^^`);
        throw new Error("JSON_ERROR_0009 expecting an escape unicode");
      }
    
      function printCodeSnippet(message) {
        const from = Math.max(0, i - 10); //sets from to maximum value between 0 and i-10
        const trimmed = from > 0; //returns true if from is positive
        const padding = (trimmed ? 4 : 0) + (i - from); //If trimmed, +4 to difference else padding = i-from
        const snippet = [
          (trimmed ? "... " : "") + str.slice(from, i + 1),
          " ".repeat(padding) + "^",
          " ".repeat(padding) + message
        ].join("\n");
        console.log(snippet);
      }
    }




let parsedJOB = parseJSON('{"title": "Engineering Degree Apprentice","company": "GE Aviation","location": "Bishops Cleeve, Cheltenham, UK","startDate": "September 2021","endDate": "January 2022","description": "Engineering Degree Apprentice for GE Aviation. Studying Computer & Electronics Engineering BEng. Lorem ipsum dolor sit amet consectetur adipisicing elit. Sequi animi voluptatum dolor nostrum? Iure recusandae nemo tempore ea minima unde."}'); 
let parsedPROJ = parseJSON(`[{
    "title": "Caelidh",
    "description": "Ceilidh is a roguelike dungeon crawler game based on Jack the giant slayer from Celtic mythology. Players will take on the role of Jack as they navigate through procedurally generated dungeons, fighting off monsters and collecting treasure along with a range of cards to expand your abilities!.",
    "url": "https://unitygroup16.itch.io/ceilidh",
    "git": "https://github.com/JakeBiggs/Caelidh",
    "skills": [
        "C#",
        "Unity",
        "Arduino",
        "LaTeX"
    ],
    "images": [
    {   "id": "img1",
        "url": "/images/caelidh.png",
        "alt": "Caelidh Logo"
    },
    {
        "id": "img2",
        "url": "/images/caelidh_screenshot.png",
        "alt": "Caelidh Gameplay Screenshot"
    },
    {
        "id": "img3",
        "url": "/images/caelidh_screenshot2.png",
        "alt": "Caelidh Gameplay Screenshot 2."
    }]
},
{
    "title": "SpaceGame - Sensor Fusion",
    "description": "Space Game is a space invader-style game, where the player navigates a spaceship using gyroscope and accelerometer data. The goal of the game is to avoidhazards, while shooting oncoming asteroids using a button. The game is designed to make the player think about orientation and maintain control over the ship. The use of real-world sensor data adds an immersive element to the gameplay that provides a unique experience for the player.",
    "url": "https://unitygroup16.itch.io/ceilidh",
    "git": "https://github.com/JakeBiggs/Caelidh",
    "skills": [
        "C#",
        "Unity",
        "Arduino",
        "LaTeX"
    ],
    "images": [
    {   "id": "img1",
        "url": "/images/spacegame1.png",
        "alt": "Caelidh Logo"
    },
    {
        "id": "img2",
        "url": "/images/spacegame2.png",
        "alt": "Caelidh Gameplay Screenshot"
    },
    {
        "id": "img3",
        "url": "/images/caelidh_screenshot2.png",
        "alt": "Caelidh Gameplay Screenshot 2."
    }]
},
{
    "title": "Caelidh",
    "description": "Ceilidh is a roguelike dungeon crawler game based on Jack the giant slayer from Celtic mythology. Players will take on the role of Jack as they navigate through procedurally generated dungeons, fighting off monsters and collecting treasure along with a range of cards to expand your abilities!.",
    "url": "https://unitygroup16.itch.io/ceilidh",
    "git": "https://github.com/JakeBiggs/Caelidh",
    "skills": [
        "C#",
        "Unity",
        "Arduino",
        "LaTeX"
    ],
    "images": [
    {   "id": "img1",
        "url": "/images/caelidh_screenshot2.png",
        "alt": "Caelidh Logo"
    },
    {
        "id": "img2",
        "url": "/images/caelidh_screenshot.png",
        "alt": "Caelidh Gameplay Screenshot"
    },
    {
        "id": "img3",
        "url": "/images/caelidh_screenshot2.png",
        "alt": "Caelidh Gameplay Screenshot 2."
    }]
},
{
    "title": "SpaceGame - Sensor Fusion",
    "description": "Space Game is a space invader-style game, where the player navigates a spaceship using gyroscope and accelerometer data. The goal of the game is to avoidhazards, while shooting oncoming asteroids using a button. The game is designed to make the player think about orientation and maintain control over the ship. The use of real-world sensor data adds an immersive element to the gameplay that provides a unique experience for the player.",
    "url": "https://unitygroup16.itch.io/ceilidh",
    "git": "https://github.com/JakeBiggs/Caelidh",
    "skills": [
        "C#",
        "Unity",
        "Arduino",
        "LaTeX"
    ],
    "images": [
    {   "id": "img1",
        "url": "/images/spacegame2.png",
        "alt": "Caelidh Logo"
    },
    {
        "id": "img2",
        "url": "/images/spacegame2.png",
        "alt": "Caelidh Gameplay Screenshot"
    },
    {
        "id": "img3",
        "url": "/images/caelidh_screenshot2.png",
        "alt": "Caelidh Gameplay Screenshot 2."
    }]
}]`);


data = parseJSON(fs.readFileSync(filepath, 'utf-8'));
//console.log(parsedPROJ[0].skills[1]);
console.log(data[0].title);
