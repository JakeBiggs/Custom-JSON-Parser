

//------- A proof of Concept JSON parser -------
//--------------By Jacob Biggs------------------
//Based on the railroad diagrams found at https://www.json.org/


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
                firstLoop=false; //Ensures no longer first loop
            }
            //move onto next character ("]")
            i++;
            return result;
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