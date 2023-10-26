

//------- A proof of Concept JSON parser -------
//--------------By Jacob Biggs------------------
//Based on the railroad/syntax diagrams found at https://www.json.org/


// Conventions:
// parseSomething(): parse the input based on JSON grammar and return a value.
// handleSomething(): handle the characters when there, but not used in final output.
// skipSomething(): ignores when characters are obsolete / could not be there.

function parseJSON(str){ //Based on https://www.json.org/img/object.png 
    let i = 0; //Resets index to 0

    //Parse child functions
    function parseObject(){
        if(str[i]==='{'){
            
            i++ //Updates to next iteration
            skipWS(); //skips whitespace 

            const result ={ }; //Initialises result as empty JS object.
            let firstLoop = true; //Sets true on first loop 

            //if next char is not "}", we go to bath of string,WS,:,value...etc
            while (str[i] !=='}'){
                if(!firstLoop){ //Not first loop as only appears before we start second loop.
                    
                    //Handles when new section is added (e.g "key:value, ")
                    handleComma(); 
                    skipWS();
                }

                const key = parseString(); //Parses key names as strings
                skipWS(); 
                handleColon();
                const value = parseValue(); //Parses value after key

                result[key] = value;

                firstLoop = false; //Resets first loop to false
            }
            //move to next character (in this case "}")
            i++;
            return result; //returns result object 
        }
    }

    function parseArray(){
        if (str[i]==='['){
            i++;
            skipWS();
            
            const result = [] //Initialises result as empty JS array.
            let firstLoop = true;
            while (str[i]!==']'){
                if(!firstLoop){
                    handleComma();
                }
                const value = parseValue(); //Parses next value in array
                result.push(value); //Appends value onto result array
                firstLoop = false; //Ensures no longer first loop
            }
            //move onto next character ("]")
            i++;
            return result;
        }
    }

    function parseValue(){
        //A value starts with "whitespace", 
        skipWS();
        //then any of the following: "string", "number", "object", "array", "true", "false" or "null", and then end with a "whitespace":
        //Attempt to parse value as string, if not try other methods
        let value;
        switch (true) {
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
            case (value = parseKeyword('null', null)) !== null:
            break;
        }
        
        skipWS(); //final whitespace after value
        return value;
    }

    //Checks whether current str.slice(i) matches the key string, if so it will return keyword's value.
    function parseKeyword(name,value){ 
        if (str.slice(i,i+ name.length) === name){
            i+= name.length;
            return value;
        }
    }

    //Handle Functions:
    function handleComma(){
        if(str[i] !== ','){
            throw new Error("Invalid Input. Expected ','.");
        }
        i++;
    }

    function handleColon(){
        if (str[i] !== ':'){
            throw new Error("Invalid Input. Expected ':'.")
        }
        i++;
    }


}