`1F471 1F3FB  ; fully-qualified     # 👱🏻 E1.0 person: light skin tone, blond hair`
/**
 * @see https://unicode.org/Public/emoticon/15.1/emoticon-test.txt
 */
/**
let test = '🚶🏼‍➡️'
test.codePointAt(0).toString(16)
test.codePointAt(2).toString(16)
test.codePointAt(6).toString(16)
test.split('')
test.split('').map(e=>e.charCodeAt(0))
test.split('').map(e=>e.charCodeAt(0).toString(16))
test2.map(e=>String.fromCharCode('0x'+e)).join('')
code값이 필요한지 재설계 필요
 */
var c = document.createElement("canvas")
var ctx = c.getContext("2d");
const em = 16;
c.width = em;
c.height = em;

/**
 * @see https://stackoverflow.com/a/67205013
 * @param {*} emoticon
 * @returns 
 */
function supportsEmoji(emoticon){
    ctx.clearRect(0, 0, em, em);
    ctx.fillText(emoticon, 0, em);
    let emo = c.toDataURL()
  
    ctx.clearRect(0, 0, em, em);
    ctx.fillText('\uFFFF', 0, em);
    let bad1 = c.toDataURL()
    ctx.clearRect(0, 0, em, em);
    ctx.fillText('\uFFFF\uFFFF', 0, em);
    let bad2 = c.toDataURL()
    ctx.clearRect(0, 0, em, em);
    ctx.fillText('\uFFFF\uFFFF\uFFFF', 0, em);
    let bad3 = c.toDataURL();
    ctx.clearRect(0, 0, em, em);
    ctx.fillText('\uFFFF\uFFFF\uFFFF\uFFFF', 0, em);
    let bad4 = c.toDataURL();
    
    return (emo != bad1) && (emo != bad2) && (emo != bad3) && (emo != bad4)
}

//let typeMapper = {};
//let groupKind = [];
//let subgroupKind = {};

let test = document.body.textContent.substring(document.body.textContent.indexOf('# group:')).split('# group:').filter(e=>e.trim() != '').reduce((groupTotal,groupText, i)=>{
    let subgroupList = groupText.split('# subgroup:');
    let groupTitle = subgroupList.shift().replaceAll('\n', '').trim();

    let subgroupObj = subgroupList.reduce((subgroupTotal, subgroupText, j) => {
        let subgroupItemList = subgroupText.split('\n').filter(e=>{
            let firstChar = e.trim().charAt(0); 
            return firstChar != '#' && firstChar != ''
        });
        let subgroupTitle = subgroupItemList.shift().replaceAll('\n', '').trim();
        subgroupItemList = subgroupItemList.map((str, k)=>{
            let splitCode = str.split(';')
            let code = splitCode[0].trim().split(' ')
            let qualifiedAndDescription = splitCode[1].split('#')
            let qualified = qualifiedAndDescription[0].trim();
            let descriptionList = qualifiedAndDescription[1].split(' ').filter(e=>e!='');
            let emoticon = descriptionList[0];
            
            if( qualified != 'fully-qualified' || ! supportsEmoji(emoticon) ){
                return undefined;
            }

            let version = descriptionList[1];
            let descriptionAndType = descriptionList.splice(2).join(' ').split(':');
            let description = descriptionAndType[0];
            let type = descriptionAndType[1]?.split(',').map(e=>e.trim()) || [];

            let toneType = type.filter(e=> e.includes('skin tone'))
            //type = type.filter(e=> ! e.includes('skin tone'));
            //type.forEach(e=>typeMapper[e]=undefined)

            //return {code, qualified, version, description, emoticon, toneType, groupTitle, subgroupTitle};
            //20231128 code, qualified, version 불필요해보여서 제거 할 예정이므로 미리 처리
            return {description, emoticon, toneType, groupTitle, subgroupTitle};
        }).filter((item) => item && item.emoticon)

        subgroupTotal[subgroupTitle] = subgroupItemList.sort((a,b)=> b.emoticon.codePointAt(0) - a.emoticon.codePointAt(0))
        /*if(subgroupKind[groupTitle]){
            subgroupKind[groupTitle].push(subgroupTitle)
        }else{
            subgroupKind[groupTitle] = [subgroupTitle];
        }*/
        return subgroupTotal;
    }, {});
    //groupKind.push(groupTitle);
    groupTotal[groupTitle] = subgroupObj; 
    
    return groupTotal;
}, {})

export const toneTypeMapper = {
    "light skin tone": "light skin tone",
    "medium-light skin tone": "medium-light skin tone",
    "medium skin tone": "medium skin tone",
    "medium-dark skin tone": "medium-dark skin tone",
    "dark skin tone": "dark skin tone"
}

export const groupKind = [
    "Smileys & Emotion",
    "People & Body",
    "Animals & Nature",
    "Food & Drink",
    "Travel & Places",
    "Activities",
    "Objects",
    "Symbols",
    "Flags"
]

export const subgroupKind = {
    "Smileys & Emotion": [
        "face-smiling",
        "face-affection",
        "face-tongue",
        "face-hand",
        "face-neutral-skeptical",
        "face-sleepy",
        "face-unwell",
        "face-hat",
        "face-glasses",
        "face-concerned",
        "face-negative",
        "face-costume",
        "cat-face",
        "monkey-face",
        "heart",
        "emotion"
    ],
    "People & Body": [
        "hand-fingers-open",
        "hand-fingers-partial",
        "hand-single-finger",
        "hand-fingers-closed",
        "hands",
        "hand-prop",
        "body-parts",
        "person",
        "person-gesture",
        "person-role",
        "person-fantasy",
        "person-activity",
        "person-sport",
        "person-resting",
        "family",
        "person-symbol"
    ],
    "Animals & Nature": [
        "animal-mammal",
        "animal-bird",
        "animal-amphibian",
        "animal-reptile",
        "animal-marine",
        "animal-bug",
        "plant-flower",
        "plant-other"
    ],
    "Food & Drink": [
        "food-fruit",
        "food-vegetable",
        "food-prepared",
        "food-asian",
        "food-marine",
        "food-sweet",
        "drink",
        "dishware"
    ],
    "Travel & Places": [
        "place-map",
        "place-geographic",
        "place-building",
        "place-religious",
        "place-other",
        "transport-ground",
        "transport-water",
        "transport-air",
        "hotel",
        "time",
        "sky & weather"
    ],
    "Activities": [
        "event",
        "award-medal",
        "sport",
        "game",
        "arts & crafts"
    ],
    "Objects": [
        "clothing",
        "sound",
        "music",
        "musical-instrument",
        "phone",
        "computer",
        "light & video",
        "book-paper",
        "money",
        "mail",
        "writing",
        "office",
        "lock",
        "tool",
        "science",
        "medical",
        "household",
        "other-object"
    ],
    "Symbols": [
        "transport-sign",
        "warning",
        "arrow",
        "religion",
        "zodiac",
        "av-symbol",
        "gender",
        "math",
        "punctuation",
        "currency",
        "other-symbol",
        "keycap",
        "alphanum",
        "geometric"
    ],
    "Flags": [
        "flag",
        "country-flag",
        "subdivision-flag"
    ]
}

export const defaultEmoticon = [
    {
        "description": "thumbs up",
        "emoticon": "👍",
        "toneType": [],
        "groupTitle": "Smileys & Emotion",
        "subgroupTitle": "hand-fingers-closed"
    },
    {
        "description": "red heart",
        "emoticon": "❤️",
        "toneType": [],
        "groupTitle": "Smileys & Emotion",
        "subgroupTitle": "heart"
    },
    {
        "description": "smiling face with hearts",
        "emoticon": "🥰",
        "toneType": [],
        "groupTitle": "Smileys & Emotion",
        "subgroupTitle": "face-affection"
    },
    {
        "description": "grinning squinting face",
        "emoticon": "😆",
        "toneType": [],
        "groupTitle": "Smileys & Emotion",
        "subgroupTitle": "face-smiling"
    },
    {
        "description": "astonished face",
        "emoticon": "😲",
        "toneType": [],
        "groupTitle": "Smileys & Emotion",
        "subgroupTitle": "face-concerned"
    },
]

export const emoticon = {
    "Smileys & Emotion": {
        "face-smiling": [
            {
                "description": "rolling on the floor laughing",
                "emoticon": "🤣",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "face-smiling"
            },
            {
                "description": "upside-down face",
                "emoticon": "🙃",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "face-smiling"
            },
            {
                "description": "slightly smiling face",
                "emoticon": "🙂",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "face-smiling"
            },
            {
                "description": "smiling face with smiling eyes",
                "emoticon": "😊",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "face-smiling"
            },
            {
                "description": "winking face",
                "emoticon": "😉",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "face-smiling"
            },
            {
                "description": "smiling face with halo",
                "emoticon": "😇",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "face-smiling"
            },
            {
                "description": "grinning squinting face",
                "emoticon": "😆",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "face-smiling"
            },
            {
                "description": "grinning face with sweat",
                "emoticon": "😅",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "face-smiling"
            },
            {
                "description": "grinning face with smiling eyes",
                "emoticon": "😄",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "face-smiling"
            },
            {
                "description": "grinning face with big eyes",
                "emoticon": "😃",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "face-smiling"
            },
            {
                "description": "face with tears of joy",
                "emoticon": "😂",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "face-smiling"
            },
            {
                "description": "beaming face with smiling eyes",
                "emoticon": "😁",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "face-smiling"
            },
            {
                "description": "grinning face",
                "emoticon": "😀",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "face-smiling"
            }
        ],
        "face-affection": [
            {
                "description": "smiling face with hearts",
                "emoticon": "🥰",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "face-affection"
            },
            {
                "description": "star-struck",
                "emoticon": "🤩",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "face-affection"
            },
            {
                "description": "kissing face with closed eyes",
                "emoticon": "😚",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "face-affection"
            },
            {
                "description": "kissing face with smiling eyes",
                "emoticon": "😙",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "face-affection"
            },
            {
                "description": "face blowing a kiss",
                "emoticon": "😘",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "face-affection"
            },
            {
                "description": "kissing face",
                "emoticon": "😗",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "face-affection"
            },
            {
                "description": "smiling face with heart-eyes",
                "emoticon": "😍",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "face-affection"
            },
            {
                "description": "smiling face",
                "emoticon": "☺️",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "face-affection"
            }
        ],
        "face-tongue": [
            {
                "description": "zany face",
                "emoticon": "🤪",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "face-tongue"
            },
            {
                "description": "money-mouth face",
                "emoticon": "🤑",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "face-tongue"
            },
            {
                "description": "squinting face with tongue",
                "emoticon": "😝",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "face-tongue"
            },
            {
                "description": "winking face with tongue",
                "emoticon": "😜",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "face-tongue"
            },
            {
                "description": "face with tongue",
                "emoticon": "😛",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "face-tongue"
            },
            {
                "description": "face savoring food",
                "emoticon": "😋",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "face-tongue"
            }
        ],
        "face-hand": [
            {
                "description": "face with hand over mouth",
                "emoticon": "🤭",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "face-hand"
            },
            {
                "description": "shushing face",
                "emoticon": "🤫",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "face-hand"
            },
            {
                "description": "smiling face with open hands",
                "emoticon": "🤗",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "face-hand"
            },
            {
                "description": "thinking face",
                "emoticon": "🤔",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "face-hand"
            }
        ],
        "face-neutral-skeptical": [
            {
                "description": "face with raised eyebrow",
                "emoticon": "🤨",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "face-neutral-skeptical"
            },
            {
                "description": "lying face",
                "emoticon": "🤥",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "face-neutral-skeptical"
            },
            {
                "description": "zipper-mouth face",
                "emoticon": "🤐",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "face-neutral-skeptical"
            },
            {
                "description": "face with rolling eyes",
                "emoticon": "🙄",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "face-neutral-skeptical"
            },
            {
                "description": "head shaking horizontally",
                "emoticon": "🙂‍↔️",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "face-neutral-skeptical"
            },
            {
                "description": "head shaking vertically",
                "emoticon": "🙂‍↕️",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "face-neutral-skeptical"
            },
            {
                "description": "face without mouth",
                "emoticon": "😶",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "face-neutral-skeptical"
            },
            {
                "description": "face in clouds",
                "emoticon": "😶‍🌫️",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "face-neutral-skeptical"
            },
            {
                "description": "face exhaling",
                "emoticon": "😮‍💨",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "face-neutral-skeptical"
            },
            {
                "description": "grimacing face",
                "emoticon": "😬",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "face-neutral-skeptical"
            },
            {
                "description": "unamused face",
                "emoticon": "😒",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "face-neutral-skeptical"
            },
            {
                "description": "expressionless face",
                "emoticon": "😑",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "face-neutral-skeptical"
            },
            {
                "description": "neutral face",
                "emoticon": "😐",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "face-neutral-skeptical"
            },
            {
                "description": "smirking face",
                "emoticon": "😏",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "face-neutral-skeptical"
            }
        ],
        "face-sleepy": [
            {
                "description": "drooling face",
                "emoticon": "🤤",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "face-sleepy"
            },
            {
                "description": "sleeping face",
                "emoticon": "😴",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "face-sleepy"
            },
            {
                "description": "sleepy face",
                "emoticon": "😪",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "face-sleepy"
            },
            {
                "description": "pensive face",
                "emoticon": "😔",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "face-sleepy"
            },
            {
                "description": "relieved face",
                "emoticon": "😌",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "face-sleepy"
            }
        ],
        "face-unwell": [
            {
                "description": "cold face",
                "emoticon": "🥶",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "face-unwell"
            },
            {
                "description": "hot face",
                "emoticon": "🥵",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "face-unwell"
            },
            {
                "description": "woozy face",
                "emoticon": "🥴",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "face-unwell"
            },
            {
                "description": "exploding head",
                "emoticon": "🤯",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "face-unwell"
            },
            {
                "description": "face vomiting",
                "emoticon": "🤮",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "face-unwell"
            },
            {
                "description": "sneezing face",
                "emoticon": "🤧",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "face-unwell"
            },
            {
                "description": "nauseated face",
                "emoticon": "🤢",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "face-unwell"
            },
            {
                "description": "face with head-bandage",
                "emoticon": "🤕",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "face-unwell"
            },
            {
                "description": "face with thermometer",
                "emoticon": "🤒",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "face-unwell"
            },
            {
                "description": "face with medical mask",
                "emoticon": "😷",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "face-unwell"
            },
            {
                "description": "face with crossed-out eyes",
                "emoticon": "😵",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "face-unwell"
            },
            {
                "description": "face with spiral eyes",
                "emoticon": "😵‍💫",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "face-unwell"
            }
        ],
        "face-hat": [
            {
                "description": "partying face",
                "emoticon": "🥳",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "face-hat"
            },
            {
                "description": "cowboy hat face",
                "emoticon": "🤠",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "face-hat"
            }
        ],
        "face-glasses": [
            {
                "description": "face with monocle",
                "emoticon": "🧐",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "face-glasses"
            },
            {
                "description": "nerd face",
                "emoticon": "🤓",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "face-glasses"
            },
            {
                "description": "smiling face with sunglasses",
                "emoticon": "😎",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "face-glasses"
            }
        ],
        "face-concerned": [
            {
                "description": "pleading face",
                "emoticon": "🥺",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "face-concerned"
            },
            {
                "description": "yawning face",
                "emoticon": "🥱",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "face-concerned"
            },
            {
                "description": "slightly frowning face",
                "emoticon": "🙁",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "face-concerned"
            },
            {
                "description": "flushed face",
                "emoticon": "😳",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "face-concerned"
            },
            {
                "description": "astonished face",
                "emoticon": "😲",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "face-concerned"
            },
            {
                "description": "face screaming in fear",
                "emoticon": "😱",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "face-concerned"
            },
            {
                "description": "anxious face with sweat",
                "emoticon": "😰",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "face-concerned"
            },
            {
                "description": "hushed face",
                "emoticon": "😯",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "face-concerned"
            },
            {
                "description": "face with open mouth",
                "emoticon": "😮",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "face-concerned"
            },
            {
                "description": "loudly crying face",
                "emoticon": "😭",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "face-concerned"
            },
            {
                "description": "tired face",
                "emoticon": "😫",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "face-concerned"
            },
            {
                "description": "weary face",
                "emoticon": "😩",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "face-concerned"
            },
            {
                "description": "fearful face",
                "emoticon": "😨",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "face-concerned"
            },
            {
                "description": "anguished face",
                "emoticon": "😧",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "face-concerned"
            },
            {
                "description": "frowning face with open mouth",
                "emoticon": "😦",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "face-concerned"
            },
            {
                "description": "sad but relieved face",
                "emoticon": "😥",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "face-concerned"
            },
            {
                "description": "persevering face",
                "emoticon": "😣",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "face-concerned"
            },
            {
                "description": "crying face",
                "emoticon": "😢",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "face-concerned"
            },
            {
                "description": "worried face",
                "emoticon": "😟",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "face-concerned"
            },
            {
                "description": "disappointed face",
                "emoticon": "😞",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "face-concerned"
            },
            {
                "description": "confounded face",
                "emoticon": "😖",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "face-concerned"
            },
            {
                "description": "confused face",
                "emoticon": "😕",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "face-concerned"
            },
            {
                "description": "downcast face with sweat",
                "emoticon": "😓",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "face-concerned"
            },
            {
                "description": "frowning face",
                "emoticon": "☹️",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "face-concerned"
            }
        ],
        "face-negative": [
            {
                "description": "face with symbols on mouth",
                "emoticon": "🤬",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "face-negative"
            },
            {
                "description": "face with steam from nose",
                "emoticon": "😤",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "face-negative"
            },
            {
                "description": "enraged face",
                "emoticon": "😡",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "face-negative"
            },
            {
                "description": "angry face",
                "emoticon": "😠",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "face-negative"
            },
            {
                "description": "smiling face with horns",
                "emoticon": "😈",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "face-negative"
            },
            {
                "description": "skull",
                "emoticon": "💀",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "face-negative"
            },
            {
                "description": "angry face with horns",
                "emoticon": "👿",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "face-negative"
            },
            {
                "description": "skull and crossbones",
                "emoticon": "☠️",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "face-negative"
            }
        ],
        "face-costume": [
            {
                "description": "clown face",
                "emoticon": "🤡",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "face-costume"
            },
            {
                "description": "robot",
                "emoticon": "🤖",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "face-costume"
            },
            {
                "description": "pile of poo",
                "emoticon": "💩",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "face-costume"
            },
            {
                "description": "alien monster",
                "emoticon": "👾",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "face-costume"
            },
            {
                "description": "alien",
                "emoticon": "👽",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "face-costume"
            },
            {
                "description": "ghost",
                "emoticon": "👻",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "face-costume"
            },
            {
                "description": "goblin",
                "emoticon": "👺",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "face-costume"
            },
            {
                "description": "ogre",
                "emoticon": "👹",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "face-costume"
            }
        ],
        "cat-face": [
            {
                "description": "weary cat",
                "emoticon": "🙀",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "cat-face"
            },
            {
                "description": "crying cat",
                "emoticon": "😿",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "cat-face"
            },
            {
                "description": "pouting cat",
                "emoticon": "😾",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "cat-face"
            },
            {
                "description": "kissing cat",
                "emoticon": "😽",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "cat-face"
            },
            {
                "description": "cat with wry smile",
                "emoticon": "😼",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "cat-face"
            },
            {
                "description": "smiling cat with heart-eyes",
                "emoticon": "😻",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "cat-face"
            },
            {
                "description": "grinning cat",
                "emoticon": "😺",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "cat-face"
            },
            {
                "description": "cat with tears of joy",
                "emoticon": "😹",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "cat-face"
            },
            {
                "description": "grinning cat with smiling eyes",
                "emoticon": "😸",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "cat-face"
            }
        ],
        "monkey-face": [
            {
                "description": "speak-no-evil monkey",
                "emoticon": "🙊",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "monkey-face"
            },
            {
                "description": "hear-no-evil monkey",
                "emoticon": "🙉",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "monkey-face"
            },
            {
                "description": "see-no-evil monkey",
                "emoticon": "🙈",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "monkey-face"
            }
        ],
        "heart": [
            {
                "description": "orange heart",
                "emoticon": "🧡",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "heart"
            },
            {
                "description": "brown heart",
                "emoticon": "🤎",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "heart"
            },
            {
                "description": "white heart",
                "emoticon": "🤍",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "heart"
            },
            {
                "description": "black heart",
                "emoticon": "🖤",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "heart"
            },
            {
                "description": "heart decoration",
                "emoticon": "💟",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "heart"
            },
            {
                "description": "revolving hearts",
                "emoticon": "💞",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "heart"
            },
            {
                "description": "heart with ribbon",
                "emoticon": "💝",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "heart"
            },
            {
                "description": "purple heart",
                "emoticon": "💜",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "heart"
            },
            {
                "description": "yellow heart",
                "emoticon": "💛",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "heart"
            },
            {
                "description": "green heart",
                "emoticon": "💚",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "heart"
            },
            {
                "description": "blue heart",
                "emoticon": "💙",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "heart"
            },
            {
                "description": "heart with arrow",
                "emoticon": "💘",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "heart"
            },
            {
                "description": "growing heart",
                "emoticon": "💗",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "heart"
            },
            {
                "description": "sparkling heart",
                "emoticon": "💖",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "heart"
            },
            {
                "description": "two hearts",
                "emoticon": "💕",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "heart"
            },
            {
                "description": "broken heart",
                "emoticon": "💔",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "heart"
            },
            {
                "description": "beating heart",
                "emoticon": "💓",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "heart"
            },
            {
                "description": "love letter",
                "emoticon": "💌",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "heart"
            },
            {
                "description": "heart on fire",
                "emoticon": "❤️‍🔥",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "heart"
            },
            {
                "description": "mending heart",
                "emoticon": "❤️‍🩹",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "heart"
            },
            {
                "description": "red heart",
                "emoticon": "❤️",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "heart"
            },
            {
                "description": "heart exclamation",
                "emoticon": "❣️",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "heart"
            }
        ],
        "emotion": [
            {
                "description": "right anger bubble",
                "emoticon": "🗯️",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "emotion"
            },
            {
                "description": "left speech bubble",
                "emoticon": "🗨️",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "emotion"
            },
            {
                "description": "hole",
                "emoticon": "🕳️",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "emotion"
            },
            {
                "description": "hundred points",
                "emoticon": "💯",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "emotion"
            },
            {
                "description": "thought balloon",
                "emoticon": "💭",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "emotion"
            },
            {
                "description": "speech balloon",
                "emoticon": "💬",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "emotion"
            },
            {
                "description": "dizzy",
                "emoticon": "💫",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "emotion"
            },
            {
                "description": "dashing away",
                "emoticon": "💨",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "emotion"
            },
            {
                "description": "sweat droplets",
                "emoticon": "💦",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "emotion"
            },
            {
                "description": "collision",
                "emoticon": "💥",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "emotion"
            },
            {
                "description": "ZZZ",
                "emoticon": "💤",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "emotion"
            },
            {
                "description": "anger symbol",
                "emoticon": "💢",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "emotion"
            },
            {
                "description": "kiss mark",
                "emoticon": "💋",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "emotion"
            },
            {
                "description": "eye in speech bubble",
                "emoticon": "👁️‍🗨️",
                "toneType": [],
                "groupTitle": "Smileys & Emotion",
                "subgroupTitle": "emotion"
            }
        ]
    },
    "People & Body": {
        "hand-fingers-open": [
            {
                "description": "raised back of hand",
                "emoticon": "🤚",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-fingers-open"
            },
            {
                "description": "raised back of hand",
                "emoticon": "🤚🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-fingers-open"
            },
            {
                "description": "raised back of hand",
                "emoticon": "🤚🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-fingers-open"
            },
            {
                "description": "raised back of hand",
                "emoticon": "🤚🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-fingers-open"
            },
            {
                "description": "raised back of hand",
                "emoticon": "🤚🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-fingers-open"
            },
            {
                "description": "raised back of hand",
                "emoticon": "🤚🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-fingers-open"
            },
            {
                "description": "vulcan salute",
                "emoticon": "🖖",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-fingers-open"
            },
            {
                "description": "vulcan salute",
                "emoticon": "🖖🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-fingers-open"
            },
            {
                "description": "vulcan salute",
                "emoticon": "🖖🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-fingers-open"
            },
            {
                "description": "vulcan salute",
                "emoticon": "🖖🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-fingers-open"
            },
            {
                "description": "vulcan salute",
                "emoticon": "🖖🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-fingers-open"
            },
            {
                "description": "vulcan salute",
                "emoticon": "🖖🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-fingers-open"
            },
            {
                "description": "hand with fingers splayed",
                "emoticon": "🖐️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-fingers-open"
            },
            {
                "description": "hand with fingers splayed",
                "emoticon": "🖐🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-fingers-open"
            },
            {
                "description": "hand with fingers splayed",
                "emoticon": "🖐🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-fingers-open"
            },
            {
                "description": "hand with fingers splayed",
                "emoticon": "🖐🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-fingers-open"
            },
            {
                "description": "hand with fingers splayed",
                "emoticon": "🖐🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-fingers-open"
            },
            {
                "description": "hand with fingers splayed",
                "emoticon": "🖐🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-fingers-open"
            },
            {
                "description": "waving hand",
                "emoticon": "👋",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-fingers-open"
            },
            {
                "description": "waving hand",
                "emoticon": "👋🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-fingers-open"
            },
            {
                "description": "waving hand",
                "emoticon": "👋🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-fingers-open"
            },
            {
                "description": "waving hand",
                "emoticon": "👋🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-fingers-open"
            },
            {
                "description": "waving hand",
                "emoticon": "👋🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-fingers-open"
            },
            {
                "description": "waving hand",
                "emoticon": "👋🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-fingers-open"
            },
            {
                "description": "raised hand",
                "emoticon": "✋",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-fingers-open"
            },
            {
                "description": "raised hand",
                "emoticon": "✋🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-fingers-open"
            },
            {
                "description": "raised hand",
                "emoticon": "✋🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-fingers-open"
            },
            {
                "description": "raised hand",
                "emoticon": "✋🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-fingers-open"
            },
            {
                "description": "raised hand",
                "emoticon": "✋🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-fingers-open"
            },
            {
                "description": "raised hand",
                "emoticon": "✋🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-fingers-open"
            }
        ],
        "hand-fingers-partial": [
            {
                "description": "love-you gesture",
                "emoticon": "🤟",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-fingers-partial"
            },
            {
                "description": "love-you gesture",
                "emoticon": "🤟🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-fingers-partial"
            },
            {
                "description": "love-you gesture",
                "emoticon": "🤟🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-fingers-partial"
            },
            {
                "description": "love-you gesture",
                "emoticon": "🤟🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-fingers-partial"
            },
            {
                "description": "love-you gesture",
                "emoticon": "🤟🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-fingers-partial"
            },
            {
                "description": "love-you gesture",
                "emoticon": "🤟🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-fingers-partial"
            },
            {
                "description": "crossed fingers",
                "emoticon": "🤞",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-fingers-partial"
            },
            {
                "description": "crossed fingers",
                "emoticon": "🤞🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-fingers-partial"
            },
            {
                "description": "crossed fingers",
                "emoticon": "🤞🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-fingers-partial"
            },
            {
                "description": "crossed fingers",
                "emoticon": "🤞🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-fingers-partial"
            },
            {
                "description": "crossed fingers",
                "emoticon": "🤞🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-fingers-partial"
            },
            {
                "description": "crossed fingers",
                "emoticon": "🤞🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-fingers-partial"
            },
            {
                "description": "call me hand",
                "emoticon": "🤙",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-fingers-partial"
            },
            {
                "description": "call me hand",
                "emoticon": "🤙🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-fingers-partial"
            },
            {
                "description": "call me hand",
                "emoticon": "🤙🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-fingers-partial"
            },
            {
                "description": "call me hand",
                "emoticon": "🤙🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-fingers-partial"
            },
            {
                "description": "call me hand",
                "emoticon": "🤙🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-fingers-partial"
            },
            {
                "description": "call me hand",
                "emoticon": "🤙🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-fingers-partial"
            },
            {
                "description": "sign of the horns",
                "emoticon": "🤘",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-fingers-partial"
            },
            {
                "description": "sign of the horns",
                "emoticon": "🤘🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-fingers-partial"
            },
            {
                "description": "sign of the horns",
                "emoticon": "🤘🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-fingers-partial"
            },
            {
                "description": "sign of the horns",
                "emoticon": "🤘🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-fingers-partial"
            },
            {
                "description": "sign of the horns",
                "emoticon": "🤘🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-fingers-partial"
            },
            {
                "description": "sign of the horns",
                "emoticon": "🤘🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-fingers-partial"
            },
            {
                "description": "pinching hand",
                "emoticon": "🤏",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-fingers-partial"
            },
            {
                "description": "pinching hand",
                "emoticon": "🤏🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-fingers-partial"
            },
            {
                "description": "pinching hand",
                "emoticon": "🤏🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-fingers-partial"
            },
            {
                "description": "pinching hand",
                "emoticon": "🤏🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-fingers-partial"
            },
            {
                "description": "pinching hand",
                "emoticon": "🤏🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-fingers-partial"
            },
            {
                "description": "pinching hand",
                "emoticon": "🤏🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-fingers-partial"
            },
            {
                "description": "OK hand",
                "emoticon": "👌",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-fingers-partial"
            },
            {
                "description": "OK hand",
                "emoticon": "👌🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-fingers-partial"
            },
            {
                "description": "OK hand",
                "emoticon": "👌🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-fingers-partial"
            },
            {
                "description": "OK hand",
                "emoticon": "👌🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-fingers-partial"
            },
            {
                "description": "OK hand",
                "emoticon": "👌🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-fingers-partial"
            },
            {
                "description": "OK hand",
                "emoticon": "👌🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-fingers-partial"
            },
            {
                "description": "victory hand",
                "emoticon": "✌️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-fingers-partial"
            },
            {
                "description": "victory hand",
                "emoticon": "✌🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-fingers-partial"
            },
            {
                "description": "victory hand",
                "emoticon": "✌🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-fingers-partial"
            },
            {
                "description": "victory hand",
                "emoticon": "✌🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-fingers-partial"
            },
            {
                "description": "victory hand",
                "emoticon": "✌🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-fingers-partial"
            },
            {
                "description": "victory hand",
                "emoticon": "✌🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-fingers-partial"
            }
        ],
        "hand-single-finger": [
            {
                "description": "middle finger",
                "emoticon": "🖕",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-single-finger"
            },
            {
                "description": "middle finger",
                "emoticon": "🖕🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-single-finger"
            },
            {
                "description": "middle finger",
                "emoticon": "🖕🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-single-finger"
            },
            {
                "description": "middle finger",
                "emoticon": "🖕🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-single-finger"
            },
            {
                "description": "middle finger",
                "emoticon": "🖕🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-single-finger"
            },
            {
                "description": "middle finger",
                "emoticon": "🖕🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-single-finger"
            },
            {
                "description": "backhand index pointing right",
                "emoticon": "👉",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-single-finger"
            },
            {
                "description": "backhand index pointing right",
                "emoticon": "👉🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-single-finger"
            },
            {
                "description": "backhand index pointing right",
                "emoticon": "👉🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-single-finger"
            },
            {
                "description": "backhand index pointing right",
                "emoticon": "👉🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-single-finger"
            },
            {
                "description": "backhand index pointing right",
                "emoticon": "👉🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-single-finger"
            },
            {
                "description": "backhand index pointing right",
                "emoticon": "👉🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-single-finger"
            },
            {
                "description": "backhand index pointing left",
                "emoticon": "👈",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-single-finger"
            },
            {
                "description": "backhand index pointing left",
                "emoticon": "👈🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-single-finger"
            },
            {
                "description": "backhand index pointing left",
                "emoticon": "👈🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-single-finger"
            },
            {
                "description": "backhand index pointing left",
                "emoticon": "👈🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-single-finger"
            },
            {
                "description": "backhand index pointing left",
                "emoticon": "👈🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-single-finger"
            },
            {
                "description": "backhand index pointing left",
                "emoticon": "👈🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-single-finger"
            },
            {
                "description": "backhand index pointing down",
                "emoticon": "👇",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-single-finger"
            },
            {
                "description": "backhand index pointing down",
                "emoticon": "👇🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-single-finger"
            },
            {
                "description": "backhand index pointing down",
                "emoticon": "👇🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-single-finger"
            },
            {
                "description": "backhand index pointing down",
                "emoticon": "👇🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-single-finger"
            },
            {
                "description": "backhand index pointing down",
                "emoticon": "👇🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-single-finger"
            },
            {
                "description": "backhand index pointing down",
                "emoticon": "👇🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-single-finger"
            },
            {
                "description": "backhand index pointing up",
                "emoticon": "👆",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-single-finger"
            },
            {
                "description": "backhand index pointing up",
                "emoticon": "👆🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-single-finger"
            },
            {
                "description": "backhand index pointing up",
                "emoticon": "👆🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-single-finger"
            },
            {
                "description": "backhand index pointing up",
                "emoticon": "👆🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-single-finger"
            },
            {
                "description": "backhand index pointing up",
                "emoticon": "👆🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-single-finger"
            },
            {
                "description": "backhand index pointing up",
                "emoticon": "👆🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-single-finger"
            },
            {
                "description": "index pointing up",
                "emoticon": "☝️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-single-finger"
            },
            {
                "description": "index pointing up",
                "emoticon": "☝🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-single-finger"
            },
            {
                "description": "index pointing up",
                "emoticon": "☝🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-single-finger"
            },
            {
                "description": "index pointing up",
                "emoticon": "☝🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-single-finger"
            },
            {
                "description": "index pointing up",
                "emoticon": "☝🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-single-finger"
            },
            {
                "description": "index pointing up",
                "emoticon": "☝🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-single-finger"
            }
        ],
        "hand-fingers-closed": [
            {
                "description": "right-facing fist",
                "emoticon": "🤜",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-fingers-closed"
            },
            {
                "description": "right-facing fist",
                "emoticon": "🤜🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-fingers-closed"
            },
            {
                "description": "right-facing fist",
                "emoticon": "🤜🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-fingers-closed"
            },
            {
                "description": "right-facing fist",
                "emoticon": "🤜🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-fingers-closed"
            },
            {
                "description": "right-facing fist",
                "emoticon": "🤜🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-fingers-closed"
            },
            {
                "description": "right-facing fist",
                "emoticon": "🤜🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-fingers-closed"
            },
            {
                "description": "left-facing fist",
                "emoticon": "🤛",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-fingers-closed"
            },
            {
                "description": "left-facing fist",
                "emoticon": "🤛🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-fingers-closed"
            },
            {
                "description": "left-facing fist",
                "emoticon": "🤛🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-fingers-closed"
            },
            {
                "description": "left-facing fist",
                "emoticon": "🤛🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-fingers-closed"
            },
            {
                "description": "left-facing fist",
                "emoticon": "🤛🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-fingers-closed"
            },
            {
                "description": "left-facing fist",
                "emoticon": "🤛🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-fingers-closed"
            },
            {
                "description": "thumbs down",
                "emoticon": "👎",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-fingers-closed"
            },
            {
                "description": "thumbs down",
                "emoticon": "👎🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-fingers-closed"
            },
            {
                "description": "thumbs down",
                "emoticon": "👎🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-fingers-closed"
            },
            {
                "description": "thumbs down",
                "emoticon": "👎🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-fingers-closed"
            },
            {
                "description": "thumbs down",
                "emoticon": "👎🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-fingers-closed"
            },
            {
                "description": "thumbs down",
                "emoticon": "👎🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-fingers-closed"
            },
            {
                "description": "thumbs up",
                "emoticon": "👍",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-fingers-closed"
            },
            {
                "description": "thumbs up",
                "emoticon": "👍🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-fingers-closed"
            },
            {
                "description": "thumbs up",
                "emoticon": "👍🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-fingers-closed"
            },
            {
                "description": "thumbs up",
                "emoticon": "👍🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-fingers-closed"
            },
            {
                "description": "thumbs up",
                "emoticon": "👍🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-fingers-closed"
            },
            {
                "description": "thumbs up",
                "emoticon": "👍🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-fingers-closed"
            },
            {
                "description": "oncoming fist",
                "emoticon": "👊",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-fingers-closed"
            },
            {
                "description": "oncoming fist",
                "emoticon": "👊🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-fingers-closed"
            },
            {
                "description": "oncoming fist",
                "emoticon": "👊🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-fingers-closed"
            },
            {
                "description": "oncoming fist",
                "emoticon": "👊🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-fingers-closed"
            },
            {
                "description": "oncoming fist",
                "emoticon": "👊🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-fingers-closed"
            },
            {
                "description": "oncoming fist",
                "emoticon": "👊🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-fingers-closed"
            },
            {
                "description": "raised fist",
                "emoticon": "✊",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-fingers-closed"
            },
            {
                "description": "raised fist",
                "emoticon": "✊🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-fingers-closed"
            },
            {
                "description": "raised fist",
                "emoticon": "✊🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-fingers-closed"
            },
            {
                "description": "raised fist",
                "emoticon": "✊🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-fingers-closed"
            },
            {
                "description": "raised fist",
                "emoticon": "✊🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-fingers-closed"
            },
            {
                "description": "raised fist",
                "emoticon": "✊🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-fingers-closed"
            }
        ],
        "hands": [
            {
                "description": "palms up together",
                "emoticon": "🤲",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "hands"
            },
            {
                "description": "palms up together",
                "emoticon": "🤲🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hands"
            },
            {
                "description": "palms up together",
                "emoticon": "🤲🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hands"
            },
            {
                "description": "palms up together",
                "emoticon": "🤲🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hands"
            },
            {
                "description": "palms up together",
                "emoticon": "🤲🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hands"
            },
            {
                "description": "palms up together",
                "emoticon": "🤲🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hands"
            },
            {
                "description": "handshake",
                "emoticon": "🤝",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "hands"
            },
            {
                "description": "handshake",
                "emoticon": "🤝🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hands"
            },
            {
                "description": "handshake",
                "emoticon": "🤝🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hands"
            },
            {
                "description": "handshake",
                "emoticon": "🤝🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hands"
            },
            {
                "description": "handshake",
                "emoticon": "🤝🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hands"
            },
            {
                "description": "handshake",
                "emoticon": "🤝🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hands"
            },
            {
                "description": "folded hands",
                "emoticon": "🙏",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "hands"
            },
            {
                "description": "folded hands",
                "emoticon": "🙏🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hands"
            },
            {
                "description": "folded hands",
                "emoticon": "🙏🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hands"
            },
            {
                "description": "folded hands",
                "emoticon": "🙏🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hands"
            },
            {
                "description": "folded hands",
                "emoticon": "🙏🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hands"
            },
            {
                "description": "folded hands",
                "emoticon": "🙏🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hands"
            },
            {
                "description": "raising hands",
                "emoticon": "🙌",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "hands"
            },
            {
                "description": "raising hands",
                "emoticon": "🙌🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hands"
            },
            {
                "description": "raising hands",
                "emoticon": "🙌🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hands"
            },
            {
                "description": "raising hands",
                "emoticon": "🙌🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hands"
            },
            {
                "description": "raising hands",
                "emoticon": "🙌🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hands"
            },
            {
                "description": "raising hands",
                "emoticon": "🙌🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hands"
            },
            {
                "description": "open hands",
                "emoticon": "👐",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "hands"
            },
            {
                "description": "open hands",
                "emoticon": "👐🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hands"
            },
            {
                "description": "open hands",
                "emoticon": "👐🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hands"
            },
            {
                "description": "open hands",
                "emoticon": "👐🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hands"
            },
            {
                "description": "open hands",
                "emoticon": "👐🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hands"
            },
            {
                "description": "open hands",
                "emoticon": "👐🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hands"
            },
            {
                "description": "clapping hands",
                "emoticon": "👏",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "hands"
            },
            {
                "description": "clapping hands",
                "emoticon": "👏🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hands"
            },
            {
                "description": "clapping hands",
                "emoticon": "👏🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hands"
            },
            {
                "description": "clapping hands",
                "emoticon": "👏🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hands"
            },
            {
                "description": "clapping hands",
                "emoticon": "👏🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hands"
            },
            {
                "description": "clapping hands",
                "emoticon": "👏🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hands"
            }
        ],
        "hand-prop": [
            {
                "description": "selfie",
                "emoticon": "🤳",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-prop"
            },
            {
                "description": "selfie",
                "emoticon": "🤳🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-prop"
            },
            {
                "description": "selfie",
                "emoticon": "🤳🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-prop"
            },
            {
                "description": "selfie",
                "emoticon": "🤳🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-prop"
            },
            {
                "description": "selfie",
                "emoticon": "🤳🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-prop"
            },
            {
                "description": "selfie",
                "emoticon": "🤳🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-prop"
            },
            {
                "description": "nail polish",
                "emoticon": "💅",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-prop"
            },
            {
                "description": "nail polish",
                "emoticon": "💅🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-prop"
            },
            {
                "description": "nail polish",
                "emoticon": "💅🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-prop"
            },
            {
                "description": "nail polish",
                "emoticon": "💅🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-prop"
            },
            {
                "description": "nail polish",
                "emoticon": "💅🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-prop"
            },
            {
                "description": "nail polish",
                "emoticon": "💅🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-prop"
            },
            {
                "description": "writing hand",
                "emoticon": "✍️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-prop"
            },
            {
                "description": "writing hand",
                "emoticon": "✍🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-prop"
            },
            {
                "description": "writing hand",
                "emoticon": "✍🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-prop"
            },
            {
                "description": "writing hand",
                "emoticon": "✍🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-prop"
            },
            {
                "description": "writing hand",
                "emoticon": "✍🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-prop"
            },
            {
                "description": "writing hand",
                "emoticon": "✍🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "hand-prop"
            }
        ],
        "body-parts": [
            {
                "description": "brain",
                "emoticon": "🧠",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "body-parts"
            },
            {
                "description": "mechanical leg",
                "emoticon": "🦿",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "body-parts"
            },
            {
                "description": "mechanical arm",
                "emoticon": "🦾",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "body-parts"
            },
            {
                "description": "ear with hearing aid",
                "emoticon": "🦻",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "body-parts"
            },
            {
                "description": "ear with hearing aid",
                "emoticon": "🦻🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "body-parts"
            },
            {
                "description": "ear with hearing aid",
                "emoticon": "🦻🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "body-parts"
            },
            {
                "description": "ear with hearing aid",
                "emoticon": "🦻🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "body-parts"
            },
            {
                "description": "ear with hearing aid",
                "emoticon": "🦻🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "body-parts"
            },
            {
                "description": "ear with hearing aid",
                "emoticon": "🦻🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "body-parts"
            },
            {
                "description": "tooth",
                "emoticon": "🦷",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "body-parts"
            },
            {
                "description": "foot",
                "emoticon": "🦶",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "body-parts"
            },
            {
                "description": "foot",
                "emoticon": "🦶🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "body-parts"
            },
            {
                "description": "foot",
                "emoticon": "🦶🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "body-parts"
            },
            {
                "description": "foot",
                "emoticon": "🦶🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "body-parts"
            },
            {
                "description": "foot",
                "emoticon": "🦶🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "body-parts"
            },
            {
                "description": "foot",
                "emoticon": "🦶🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "body-parts"
            },
            {
                "description": "leg",
                "emoticon": "🦵",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "body-parts"
            },
            {
                "description": "leg",
                "emoticon": "🦵🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "body-parts"
            },
            {
                "description": "leg",
                "emoticon": "🦵🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "body-parts"
            },
            {
                "description": "leg",
                "emoticon": "🦵🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "body-parts"
            },
            {
                "description": "leg",
                "emoticon": "🦵🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "body-parts"
            },
            {
                "description": "leg",
                "emoticon": "🦵🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "body-parts"
            },
            {
                "description": "bone",
                "emoticon": "🦴",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "body-parts"
            },
            {
                "description": "flexed biceps",
                "emoticon": "💪",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "body-parts"
            },
            {
                "description": "flexed biceps",
                "emoticon": "💪🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "body-parts"
            },
            {
                "description": "flexed biceps",
                "emoticon": "💪🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "body-parts"
            },
            {
                "description": "flexed biceps",
                "emoticon": "💪🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "body-parts"
            },
            {
                "description": "flexed biceps",
                "emoticon": "💪🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "body-parts"
            },
            {
                "description": "flexed biceps",
                "emoticon": "💪🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "body-parts"
            },
            {
                "description": "tongue",
                "emoticon": "👅",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "body-parts"
            },
            {
                "description": "mouth",
                "emoticon": "👄",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "body-parts"
            },
            {
                "description": "nose",
                "emoticon": "👃",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "body-parts"
            },
            {
                "description": "nose",
                "emoticon": "👃🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "body-parts"
            },
            {
                "description": "nose",
                "emoticon": "👃🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "body-parts"
            },
            {
                "description": "nose",
                "emoticon": "👃🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "body-parts"
            },
            {
                "description": "nose",
                "emoticon": "👃🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "body-parts"
            },
            {
                "description": "nose",
                "emoticon": "👃🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "body-parts"
            },
            {
                "description": "ear",
                "emoticon": "👂",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "body-parts"
            },
            {
                "description": "ear",
                "emoticon": "👂🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "body-parts"
            },
            {
                "description": "ear",
                "emoticon": "👂🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "body-parts"
            },
            {
                "description": "ear",
                "emoticon": "👂🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "body-parts"
            },
            {
                "description": "ear",
                "emoticon": "👂🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "body-parts"
            },
            {
                "description": "ear",
                "emoticon": "👂🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "body-parts"
            },
            {
                "description": "eye",
                "emoticon": "👁️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "body-parts"
            },
            {
                "description": "eyes",
                "emoticon": "👀",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "body-parts"
            }
        ],
        "person": [
            {
                "description": "person",
                "emoticon": "🧔",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "person",
                "emoticon": "🧔🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "person",
                "emoticon": "🧔🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "person",
                "emoticon": "🧔🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "person",
                "emoticon": "🧔🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "person",
                "emoticon": "🧔🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "man",
                "emoticon": "🧔‍♂️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "man",
                "emoticon": "🧔🏻‍♂️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "man",
                "emoticon": "🧔🏼‍♂️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "man",
                "emoticon": "🧔🏽‍♂️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "man",
                "emoticon": "🧔🏾‍♂️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "man",
                "emoticon": "🧔🏿‍♂️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "woman",
                "emoticon": "🧔‍♀️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "woman",
                "emoticon": "🧔🏻‍♀️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "woman",
                "emoticon": "🧔🏼‍♀️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "woman",
                "emoticon": "🧔🏽‍♀️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "woman",
                "emoticon": "🧔🏾‍♀️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "woman",
                "emoticon": "🧔🏿‍♀️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "older person",
                "emoticon": "🧓",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "older person",
                "emoticon": "🧓🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "older person",
                "emoticon": "🧓🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "older person",
                "emoticon": "🧓🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "older person",
                "emoticon": "🧓🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "older person",
                "emoticon": "🧓🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "child",
                "emoticon": "🧒",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "child",
                "emoticon": "🧒🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "child",
                "emoticon": "🧒🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "child",
                "emoticon": "🧒🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "child",
                "emoticon": "🧒🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "child",
                "emoticon": "🧒🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "person",
                "emoticon": "🧑",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "person",
                "emoticon": "🧑🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "person",
                "emoticon": "🧑🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "person",
                "emoticon": "🧑🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "person",
                "emoticon": "🧑🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "person",
                "emoticon": "🧑🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "person",
                "emoticon": "🧑‍🦰",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "person",
                "emoticon": "🧑🏻‍🦰",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "person",
                "emoticon": "🧑🏼‍🦰",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "person",
                "emoticon": "🧑🏽‍🦰",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "person",
                "emoticon": "🧑🏾‍🦰",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "person",
                "emoticon": "🧑🏿‍🦰",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "person",
                "emoticon": "🧑‍🦱",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "person",
                "emoticon": "🧑🏻‍🦱",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "person",
                "emoticon": "🧑🏼‍🦱",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "person",
                "emoticon": "🧑🏽‍🦱",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "person",
                "emoticon": "🧑🏾‍🦱",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "person",
                "emoticon": "🧑🏿‍🦱",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "person",
                "emoticon": "🧑‍🦳",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "person",
                "emoticon": "🧑🏻‍🦳",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "person",
                "emoticon": "🧑🏼‍🦳",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "person",
                "emoticon": "🧑🏽‍🦳",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "person",
                "emoticon": "🧑🏾‍🦳",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "person",
                "emoticon": "🧑🏿‍🦳",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "person",
                "emoticon": "🧑‍🦲",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "person",
                "emoticon": "🧑🏻‍🦲",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "person",
                "emoticon": "🧑🏼‍🦲",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "person",
                "emoticon": "🧑🏽‍🦲",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "person",
                "emoticon": "🧑🏾‍🦲",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "person",
                "emoticon": "🧑🏿‍🦲",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "baby",
                "emoticon": "👶",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "baby",
                "emoticon": "👶🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "baby",
                "emoticon": "👶🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "baby",
                "emoticon": "👶🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "baby",
                "emoticon": "👶🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "baby",
                "emoticon": "👶🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "old woman",
                "emoticon": "👵",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "old woman",
                "emoticon": "👵🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "old woman",
                "emoticon": "👵🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "old woman",
                "emoticon": "👵🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "old woman",
                "emoticon": "👵🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "old woman",
                "emoticon": "👵🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "old man",
                "emoticon": "👴",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "old man",
                "emoticon": "👴🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "old man",
                "emoticon": "👴🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "old man",
                "emoticon": "👴🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "old man",
                "emoticon": "👴🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "old man",
                "emoticon": "👴🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "person",
                "emoticon": "👱",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "person",
                "emoticon": "👱🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "person",
                "emoticon": "👱🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "person",
                "emoticon": "👱🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "person",
                "emoticon": "👱🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "person",
                "emoticon": "👱🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "woman",
                "emoticon": "👱‍♀️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "woman",
                "emoticon": "👱🏻‍♀️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "woman",
                "emoticon": "👱🏼‍♀️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "woman",
                "emoticon": "👱🏽‍♀️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "woman",
                "emoticon": "👱🏾‍♀️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "woman",
                "emoticon": "👱🏿‍♀️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "man",
                "emoticon": "👱‍♂️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "man",
                "emoticon": "👱🏻‍♂️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "man",
                "emoticon": "👱🏼‍♂️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "man",
                "emoticon": "👱🏽‍♂️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "man",
                "emoticon": "👱🏾‍♂️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "man",
                "emoticon": "👱🏿‍♂️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "woman",
                "emoticon": "👩",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "woman",
                "emoticon": "👩🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "woman",
                "emoticon": "👩🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "woman",
                "emoticon": "👩🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "woman",
                "emoticon": "👩🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "woman",
                "emoticon": "👩🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "woman",
                "emoticon": "👩‍🦰",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "woman",
                "emoticon": "👩🏻‍🦰",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "woman",
                "emoticon": "👩🏼‍🦰",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "woman",
                "emoticon": "👩🏽‍🦰",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "woman",
                "emoticon": "👩🏾‍🦰",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "woman",
                "emoticon": "👩🏿‍🦰",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "woman",
                "emoticon": "👩‍🦱",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "woman",
                "emoticon": "👩🏻‍🦱",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "woman",
                "emoticon": "👩🏼‍🦱",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "woman",
                "emoticon": "👩🏽‍🦱",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "woman",
                "emoticon": "👩🏾‍🦱",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "woman",
                "emoticon": "👩🏿‍🦱",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "woman",
                "emoticon": "👩‍🦳",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "woman",
                "emoticon": "👩🏻‍🦳",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "woman",
                "emoticon": "👩🏼‍🦳",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "woman",
                "emoticon": "👩🏽‍🦳",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "woman",
                "emoticon": "👩🏾‍🦳",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "woman",
                "emoticon": "👩🏿‍🦳",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "woman",
                "emoticon": "👩‍🦲",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "woman",
                "emoticon": "👩🏻‍🦲",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "woman",
                "emoticon": "👩🏼‍🦲",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "woman",
                "emoticon": "👩🏽‍🦲",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "woman",
                "emoticon": "👩🏾‍🦲",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "woman",
                "emoticon": "👩🏿‍🦲",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "man",
                "emoticon": "👨",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "man",
                "emoticon": "👨🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "man",
                "emoticon": "👨🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "man",
                "emoticon": "👨🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "man",
                "emoticon": "👨🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "man",
                "emoticon": "👨🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "man",
                "emoticon": "👨‍🦰",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "man",
                "emoticon": "👨🏻‍🦰",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "man",
                "emoticon": "👨🏼‍🦰",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "man",
                "emoticon": "👨🏽‍🦰",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "man",
                "emoticon": "👨🏾‍🦰",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "man",
                "emoticon": "👨🏿‍🦰",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "man",
                "emoticon": "👨‍🦱",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "man",
                "emoticon": "👨🏻‍🦱",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "man",
                "emoticon": "👨🏼‍🦱",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "man",
                "emoticon": "👨🏽‍🦱",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "man",
                "emoticon": "👨🏾‍🦱",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "man",
                "emoticon": "👨🏿‍🦱",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "man",
                "emoticon": "👨‍🦳",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "man",
                "emoticon": "👨🏻‍🦳",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "man",
                "emoticon": "👨🏼‍🦳",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "man",
                "emoticon": "👨🏽‍🦳",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "man",
                "emoticon": "👨🏾‍🦳",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "man",
                "emoticon": "👨🏿‍🦳",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "man",
                "emoticon": "👨‍🦲",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "man",
                "emoticon": "👨🏻‍🦲",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "man",
                "emoticon": "👨🏼‍🦲",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "man",
                "emoticon": "👨🏽‍🦲",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "man",
                "emoticon": "👨🏾‍🦲",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "man",
                "emoticon": "👨🏿‍🦲",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "girl",
                "emoticon": "👧",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "girl",
                "emoticon": "👧🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "girl",
                "emoticon": "👧🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "girl",
                "emoticon": "👧🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "girl",
                "emoticon": "👧🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "girl",
                "emoticon": "👧🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "boy",
                "emoticon": "👦",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "boy",
                "emoticon": "👦🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "boy",
                "emoticon": "👦🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "boy",
                "emoticon": "👦🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "boy",
                "emoticon": "👦🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            },
            {
                "description": "boy",
                "emoticon": "👦🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person"
            }
        ],
        "person-gesture": [
            {
                "description": "deaf person",
                "emoticon": "🧏",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "deaf person",
                "emoticon": "🧏🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "deaf person",
                "emoticon": "🧏🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "deaf person",
                "emoticon": "🧏🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "deaf person",
                "emoticon": "🧏🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "deaf person",
                "emoticon": "🧏🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "deaf man",
                "emoticon": "🧏‍♂️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "deaf man",
                "emoticon": "🧏🏻‍♂️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "deaf man",
                "emoticon": "🧏🏼‍♂️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "deaf man",
                "emoticon": "🧏🏽‍♂️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "deaf man",
                "emoticon": "🧏🏾‍♂️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "deaf man",
                "emoticon": "🧏🏿‍♂️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "deaf woman",
                "emoticon": "🧏‍♀️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "deaf woman",
                "emoticon": "🧏🏻‍♀️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "deaf woman",
                "emoticon": "🧏🏼‍♀️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "deaf woman",
                "emoticon": "🧏🏽‍♀️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "deaf woman",
                "emoticon": "🧏🏾‍♀️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "deaf woman",
                "emoticon": "🧏🏿‍♀️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "person shrugging",
                "emoticon": "🤷",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "person shrugging",
                "emoticon": "🤷🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "person shrugging",
                "emoticon": "🤷🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "person shrugging",
                "emoticon": "🤷🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "person shrugging",
                "emoticon": "🤷🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "person shrugging",
                "emoticon": "🤷🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "man shrugging",
                "emoticon": "🤷‍♂️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "man shrugging",
                "emoticon": "🤷🏻‍♂️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "man shrugging",
                "emoticon": "🤷🏼‍♂️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "man shrugging",
                "emoticon": "🤷🏽‍♂️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "man shrugging",
                "emoticon": "🤷🏾‍♂️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "man shrugging",
                "emoticon": "🤷🏿‍♂️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "woman shrugging",
                "emoticon": "🤷‍♀️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "woman shrugging",
                "emoticon": "🤷🏻‍♀️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "woman shrugging",
                "emoticon": "🤷🏼‍♀️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "woman shrugging",
                "emoticon": "🤷🏽‍♀️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "woman shrugging",
                "emoticon": "🤷🏾‍♀️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "woman shrugging",
                "emoticon": "🤷🏿‍♀️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "person facepalming",
                "emoticon": "🤦",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "person facepalming",
                "emoticon": "🤦🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "person facepalming",
                "emoticon": "🤦🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "person facepalming",
                "emoticon": "🤦🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "person facepalming",
                "emoticon": "🤦🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "person facepalming",
                "emoticon": "🤦🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "man facepalming",
                "emoticon": "🤦‍♂️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "man facepalming",
                "emoticon": "🤦🏻‍♂️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "man facepalming",
                "emoticon": "🤦🏼‍♂️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "man facepalming",
                "emoticon": "🤦🏽‍♂️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "man facepalming",
                "emoticon": "🤦🏾‍♂️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "man facepalming",
                "emoticon": "🤦🏿‍♂️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "woman facepalming",
                "emoticon": "🤦‍♀️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "woman facepalming",
                "emoticon": "🤦🏻‍♀️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "woman facepalming",
                "emoticon": "🤦🏼‍♀️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "woman facepalming",
                "emoticon": "🤦🏽‍♀️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "woman facepalming",
                "emoticon": "🤦🏾‍♀️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "woman facepalming",
                "emoticon": "🤦🏿‍♀️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "person pouting",
                "emoticon": "🙎",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "person pouting",
                "emoticon": "🙎🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "person pouting",
                "emoticon": "🙎🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "person pouting",
                "emoticon": "🙎🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "person pouting",
                "emoticon": "🙎🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "person pouting",
                "emoticon": "🙎🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "man pouting",
                "emoticon": "🙎‍♂️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "man pouting",
                "emoticon": "🙎🏻‍♂️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "man pouting",
                "emoticon": "🙎🏼‍♂️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "man pouting",
                "emoticon": "🙎🏽‍♂️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "man pouting",
                "emoticon": "🙎🏾‍♂️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "man pouting",
                "emoticon": "🙎🏿‍♂️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "woman pouting",
                "emoticon": "🙎‍♀️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "woman pouting",
                "emoticon": "🙎🏻‍♀️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "woman pouting",
                "emoticon": "🙎🏼‍♀️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "woman pouting",
                "emoticon": "🙎🏽‍♀️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "woman pouting",
                "emoticon": "🙎🏾‍♀️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "woman pouting",
                "emoticon": "🙎🏿‍♀️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "person frowning",
                "emoticon": "🙍",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "person frowning",
                "emoticon": "🙍🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "person frowning",
                "emoticon": "🙍🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "person frowning",
                "emoticon": "🙍🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "person frowning",
                "emoticon": "🙍🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "person frowning",
                "emoticon": "🙍🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "man frowning",
                "emoticon": "🙍‍♂️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "man frowning",
                "emoticon": "🙍🏻‍♂️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "man frowning",
                "emoticon": "🙍🏼‍♂️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "man frowning",
                "emoticon": "🙍🏽‍♂️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "man frowning",
                "emoticon": "🙍🏾‍♂️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "man frowning",
                "emoticon": "🙍🏿‍♂️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "woman frowning",
                "emoticon": "🙍‍♀️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "woman frowning",
                "emoticon": "🙍🏻‍♀️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "woman frowning",
                "emoticon": "🙍🏼‍♀️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "woman frowning",
                "emoticon": "🙍🏽‍♀️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "woman frowning",
                "emoticon": "🙍🏾‍♀️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "woman frowning",
                "emoticon": "🙍🏿‍♀️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "person raising hand",
                "emoticon": "🙋",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "person raising hand",
                "emoticon": "🙋🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "person raising hand",
                "emoticon": "🙋🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "person raising hand",
                "emoticon": "🙋🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "person raising hand",
                "emoticon": "🙋🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "person raising hand",
                "emoticon": "🙋🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "man raising hand",
                "emoticon": "🙋‍♂️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "man raising hand",
                "emoticon": "🙋🏻‍♂️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "man raising hand",
                "emoticon": "🙋🏼‍♂️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "man raising hand",
                "emoticon": "🙋🏽‍♂️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "man raising hand",
                "emoticon": "🙋🏾‍♂️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "man raising hand",
                "emoticon": "🙋🏿‍♂️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "woman raising hand",
                "emoticon": "🙋‍♀️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "woman raising hand",
                "emoticon": "🙋🏻‍♀️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "woman raising hand",
                "emoticon": "🙋🏼‍♀️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "woman raising hand",
                "emoticon": "🙋🏽‍♀️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "woman raising hand",
                "emoticon": "🙋🏾‍♀️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "woman raising hand",
                "emoticon": "🙋🏿‍♀️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "person bowing",
                "emoticon": "🙇",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "person bowing",
                "emoticon": "🙇🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "person bowing",
                "emoticon": "🙇🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "person bowing",
                "emoticon": "🙇🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "person bowing",
                "emoticon": "🙇🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "person bowing",
                "emoticon": "🙇🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "man bowing",
                "emoticon": "🙇‍♂️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "man bowing",
                "emoticon": "🙇🏻‍♂️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "man bowing",
                "emoticon": "🙇🏼‍♂️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "man bowing",
                "emoticon": "🙇🏽‍♂️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "man bowing",
                "emoticon": "🙇🏾‍♂️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "man bowing",
                "emoticon": "🙇🏿‍♂️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "woman bowing",
                "emoticon": "🙇‍♀️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "woman bowing",
                "emoticon": "🙇🏻‍♀️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "woman bowing",
                "emoticon": "🙇🏼‍♀️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "woman bowing",
                "emoticon": "🙇🏽‍♀️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "woman bowing",
                "emoticon": "🙇🏾‍♀️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "woman bowing",
                "emoticon": "🙇🏿‍♀️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "person gesturing OK",
                "emoticon": "🙆",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "person gesturing OK",
                "emoticon": "🙆🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "person gesturing OK",
                "emoticon": "🙆🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "person gesturing OK",
                "emoticon": "🙆🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "person gesturing OK",
                "emoticon": "🙆🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "person gesturing OK",
                "emoticon": "🙆🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "man gesturing OK",
                "emoticon": "🙆‍♂️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "man gesturing OK",
                "emoticon": "🙆🏻‍♂️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "man gesturing OK",
                "emoticon": "🙆🏼‍♂️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "man gesturing OK",
                "emoticon": "🙆🏽‍♂️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "man gesturing OK",
                "emoticon": "🙆🏾‍♂️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "man gesturing OK",
                "emoticon": "🙆🏿‍♂️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "woman gesturing OK",
                "emoticon": "🙆‍♀️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "woman gesturing OK",
                "emoticon": "🙆🏻‍♀️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "woman gesturing OK",
                "emoticon": "🙆🏼‍♀️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "woman gesturing OK",
                "emoticon": "🙆🏽‍♀️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "woman gesturing OK",
                "emoticon": "🙆🏾‍♀️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "woman gesturing OK",
                "emoticon": "🙆🏿‍♀️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "person gesturing NO",
                "emoticon": "🙅",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "person gesturing NO",
                "emoticon": "🙅🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "person gesturing NO",
                "emoticon": "🙅🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "person gesturing NO",
                "emoticon": "🙅🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "person gesturing NO",
                "emoticon": "🙅🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "person gesturing NO",
                "emoticon": "🙅🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "man gesturing NO",
                "emoticon": "🙅‍♂️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "man gesturing NO",
                "emoticon": "🙅🏻‍♂️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "man gesturing NO",
                "emoticon": "🙅🏼‍♂️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "man gesturing NO",
                "emoticon": "🙅🏽‍♂️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "man gesturing NO",
                "emoticon": "🙅🏾‍♂️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "man gesturing NO",
                "emoticon": "🙅🏿‍♂️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "woman gesturing NO",
                "emoticon": "🙅‍♀️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "woman gesturing NO",
                "emoticon": "🙅🏻‍♀️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "woman gesturing NO",
                "emoticon": "🙅🏼‍♀️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "woman gesturing NO",
                "emoticon": "🙅🏽‍♀️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "woman gesturing NO",
                "emoticon": "🙅🏾‍♀️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "woman gesturing NO",
                "emoticon": "🙅🏿‍♀️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "person tipping hand",
                "emoticon": "💁",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "person tipping hand",
                "emoticon": "💁🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "person tipping hand",
                "emoticon": "💁🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "person tipping hand",
                "emoticon": "💁🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "person tipping hand",
                "emoticon": "💁🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "person tipping hand",
                "emoticon": "💁🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "man tipping hand",
                "emoticon": "💁‍♂️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "man tipping hand",
                "emoticon": "💁🏻‍♂️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "man tipping hand",
                "emoticon": "💁🏼‍♂️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "man tipping hand",
                "emoticon": "💁🏽‍♂️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "man tipping hand",
                "emoticon": "💁🏾‍♂️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "man tipping hand",
                "emoticon": "💁🏿‍♂️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "woman tipping hand",
                "emoticon": "💁‍♀️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "woman tipping hand",
                "emoticon": "💁🏻‍♀️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "woman tipping hand",
                "emoticon": "💁🏼‍♀️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "woman tipping hand",
                "emoticon": "💁🏽‍♀️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "woman tipping hand",
                "emoticon": "💁🏾‍♀️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            },
            {
                "description": "woman tipping hand",
                "emoticon": "💁🏿‍♀️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-gesture"
            }
        ],
        "person-role": [
            {
                "description": "woman with headscarf",
                "emoticon": "🧕",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman with headscarf",
                "emoticon": "🧕🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman with headscarf",
                "emoticon": "🧕🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman with headscarf",
                "emoticon": "🧕🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman with headscarf",
                "emoticon": "🧕🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman with headscarf",
                "emoticon": "🧕🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "health worker",
                "emoticon": "🧑‍⚕️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "health worker",
                "emoticon": "🧑🏻‍⚕️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "health worker",
                "emoticon": "🧑🏼‍⚕️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "health worker",
                "emoticon": "🧑🏽‍⚕️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "health worker",
                "emoticon": "🧑🏾‍⚕️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "health worker",
                "emoticon": "🧑🏿‍⚕️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "student",
                "emoticon": "🧑‍🎓",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "student",
                "emoticon": "🧑🏻‍🎓",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "student",
                "emoticon": "🧑🏼‍🎓",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "student",
                "emoticon": "🧑🏽‍🎓",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "student",
                "emoticon": "🧑🏾‍🎓",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "student",
                "emoticon": "🧑🏿‍🎓",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "teacher",
                "emoticon": "🧑‍🏫",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "teacher",
                "emoticon": "🧑🏻‍🏫",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "teacher",
                "emoticon": "🧑🏼‍🏫",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "teacher",
                "emoticon": "🧑🏽‍🏫",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "teacher",
                "emoticon": "🧑🏾‍🏫",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "teacher",
                "emoticon": "🧑🏿‍🏫",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "judge",
                "emoticon": "🧑‍⚖️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "judge",
                "emoticon": "🧑🏻‍⚖️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "judge",
                "emoticon": "🧑🏼‍⚖️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "judge",
                "emoticon": "🧑🏽‍⚖️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "judge",
                "emoticon": "🧑🏾‍⚖️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "judge",
                "emoticon": "🧑🏿‍⚖️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "farmer",
                "emoticon": "🧑‍🌾",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "farmer",
                "emoticon": "🧑🏻‍🌾",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "farmer",
                "emoticon": "🧑🏼‍🌾",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "farmer",
                "emoticon": "🧑🏽‍🌾",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "farmer",
                "emoticon": "🧑🏾‍🌾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "farmer",
                "emoticon": "🧑🏿‍🌾",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "cook",
                "emoticon": "🧑‍🍳",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "cook",
                "emoticon": "🧑🏻‍🍳",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "cook",
                "emoticon": "🧑🏼‍🍳",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "cook",
                "emoticon": "🧑🏽‍🍳",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "cook",
                "emoticon": "🧑🏾‍🍳",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "cook",
                "emoticon": "🧑🏿‍🍳",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "mechanic",
                "emoticon": "🧑‍🔧",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "mechanic",
                "emoticon": "🧑🏻‍🔧",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "mechanic",
                "emoticon": "🧑🏼‍🔧",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "mechanic",
                "emoticon": "🧑🏽‍🔧",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "mechanic",
                "emoticon": "🧑🏾‍🔧",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "mechanic",
                "emoticon": "🧑🏿‍🔧",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "factory worker",
                "emoticon": "🧑‍🏭",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "factory worker",
                "emoticon": "🧑🏻‍🏭",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "factory worker",
                "emoticon": "🧑🏼‍🏭",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "factory worker",
                "emoticon": "🧑🏽‍🏭",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "factory worker",
                "emoticon": "🧑🏾‍🏭",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "factory worker",
                "emoticon": "🧑🏿‍🏭",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "office worker",
                "emoticon": "🧑‍💼",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "office worker",
                "emoticon": "🧑🏻‍💼",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "office worker",
                "emoticon": "🧑🏼‍💼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "office worker",
                "emoticon": "🧑🏽‍💼",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "office worker",
                "emoticon": "🧑🏾‍💼",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "office worker",
                "emoticon": "🧑🏿‍💼",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "scientist",
                "emoticon": "🧑‍🔬",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "scientist",
                "emoticon": "🧑🏻‍🔬",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "scientist",
                "emoticon": "🧑🏼‍🔬",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "scientist",
                "emoticon": "🧑🏽‍🔬",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "scientist",
                "emoticon": "🧑🏾‍🔬",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "scientist",
                "emoticon": "🧑🏿‍🔬",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "technologist",
                "emoticon": "🧑‍💻",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "technologist",
                "emoticon": "🧑🏻‍💻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "technologist",
                "emoticon": "🧑🏼‍💻",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "technologist",
                "emoticon": "🧑🏽‍💻",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "technologist",
                "emoticon": "🧑🏾‍💻",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "technologist",
                "emoticon": "🧑🏿‍💻",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "singer",
                "emoticon": "🧑‍🎤",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "singer",
                "emoticon": "🧑🏻‍🎤",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "singer",
                "emoticon": "🧑🏼‍🎤",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "singer",
                "emoticon": "🧑🏽‍🎤",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "singer",
                "emoticon": "🧑🏾‍🎤",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "singer",
                "emoticon": "🧑🏿‍🎤",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "artist",
                "emoticon": "🧑‍🎨",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "artist",
                "emoticon": "🧑🏻‍🎨",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "artist",
                "emoticon": "🧑🏼‍🎨",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "artist",
                "emoticon": "🧑🏽‍🎨",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "artist",
                "emoticon": "🧑🏾‍🎨",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "artist",
                "emoticon": "🧑🏿‍🎨",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "pilot",
                "emoticon": "🧑‍✈️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "pilot",
                "emoticon": "🧑🏻‍✈️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "pilot",
                "emoticon": "🧑🏼‍✈️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "pilot",
                "emoticon": "🧑🏽‍✈️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "pilot",
                "emoticon": "🧑🏾‍✈️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "pilot",
                "emoticon": "🧑🏿‍✈️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "astronaut",
                "emoticon": "🧑‍🚀",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "astronaut",
                "emoticon": "🧑🏻‍🚀",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "astronaut",
                "emoticon": "🧑🏼‍🚀",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "astronaut",
                "emoticon": "🧑🏽‍🚀",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "astronaut",
                "emoticon": "🧑🏾‍🚀",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "astronaut",
                "emoticon": "🧑🏿‍🚀",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "firefighter",
                "emoticon": "🧑‍🚒",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "firefighter",
                "emoticon": "🧑🏻‍🚒",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "firefighter",
                "emoticon": "🧑🏼‍🚒",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "firefighter",
                "emoticon": "🧑🏽‍🚒",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "firefighter",
                "emoticon": "🧑🏾‍🚒",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "firefighter",
                "emoticon": "🧑🏿‍🚒",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "person feeding baby",
                "emoticon": "🧑‍🍼",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "person feeding baby",
                "emoticon": "🧑🏻‍🍼",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "person feeding baby",
                "emoticon": "🧑🏼‍🍼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "person feeding baby",
                "emoticon": "🧑🏽‍🍼",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "person feeding baby",
                "emoticon": "🧑🏾‍🍼",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "person feeding baby",
                "emoticon": "🧑🏿‍🍼",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "person in tuxedo",
                "emoticon": "🤵",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "person in tuxedo",
                "emoticon": "🤵🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "person in tuxedo",
                "emoticon": "🤵🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "person in tuxedo",
                "emoticon": "🤵🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "person in tuxedo",
                "emoticon": "🤵🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "person in tuxedo",
                "emoticon": "🤵🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man in tuxedo",
                "emoticon": "🤵‍♂️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man in tuxedo",
                "emoticon": "🤵🏻‍♂️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man in tuxedo",
                "emoticon": "🤵🏼‍♂️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man in tuxedo",
                "emoticon": "🤵🏽‍♂️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man in tuxedo",
                "emoticon": "🤵🏾‍♂️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man in tuxedo",
                "emoticon": "🤵🏿‍♂️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman in tuxedo",
                "emoticon": "🤵‍♀️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman in tuxedo",
                "emoticon": "🤵🏻‍♀️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman in tuxedo",
                "emoticon": "🤵🏼‍♀️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman in tuxedo",
                "emoticon": "🤵🏽‍♀️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman in tuxedo",
                "emoticon": "🤵🏾‍♀️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman in tuxedo",
                "emoticon": "🤵🏿‍♀️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "prince",
                "emoticon": "🤴",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "prince",
                "emoticon": "🤴🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "prince",
                "emoticon": "🤴🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "prince",
                "emoticon": "🤴🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "prince",
                "emoticon": "🤴🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "prince",
                "emoticon": "🤴🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "breast-feeding",
                "emoticon": "🤱",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "breast-feeding",
                "emoticon": "🤱🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "breast-feeding",
                "emoticon": "🤱🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "breast-feeding",
                "emoticon": "🤱🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "breast-feeding",
                "emoticon": "🤱🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "breast-feeding",
                "emoticon": "🤱🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "pregnant woman",
                "emoticon": "🤰",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "pregnant woman",
                "emoticon": "🤰🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "pregnant woman",
                "emoticon": "🤰🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "pregnant woman",
                "emoticon": "🤰🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "pregnant woman",
                "emoticon": "🤰🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "pregnant woman",
                "emoticon": "🤰🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "detective",
                "emoticon": "🕵️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "detective",
                "emoticon": "🕵🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "detective",
                "emoticon": "🕵🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "detective",
                "emoticon": "🕵🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "detective",
                "emoticon": "🕵🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "detective",
                "emoticon": "🕵🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man detective",
                "emoticon": "🕵️‍♂️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man detective",
                "emoticon": "🕵🏻‍♂️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man detective",
                "emoticon": "🕵🏼‍♂️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man detective",
                "emoticon": "🕵🏽‍♂️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man detective",
                "emoticon": "🕵🏾‍♂️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man detective",
                "emoticon": "🕵🏿‍♂️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman detective",
                "emoticon": "🕵️‍♀️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman detective",
                "emoticon": "🕵🏻‍♀️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman detective",
                "emoticon": "🕵🏼‍♀️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman detective",
                "emoticon": "🕵🏽‍♀️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman detective",
                "emoticon": "🕵🏾‍♀️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman detective",
                "emoticon": "🕵🏿‍♀️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "guard",
                "emoticon": "💂",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "guard",
                "emoticon": "💂🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "guard",
                "emoticon": "💂🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "guard",
                "emoticon": "💂🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "guard",
                "emoticon": "💂🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "guard",
                "emoticon": "💂🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man guard",
                "emoticon": "💂‍♂️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man guard",
                "emoticon": "💂🏻‍♂️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man guard",
                "emoticon": "💂🏼‍♂️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man guard",
                "emoticon": "💂🏽‍♂️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man guard",
                "emoticon": "💂🏾‍♂️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man guard",
                "emoticon": "💂🏿‍♂️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman guard",
                "emoticon": "💂‍♀️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman guard",
                "emoticon": "💂🏻‍♀️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman guard",
                "emoticon": "💂🏼‍♀️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman guard",
                "emoticon": "💂🏽‍♀️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman guard",
                "emoticon": "💂🏾‍♀️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman guard",
                "emoticon": "💂🏿‍♀️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "princess",
                "emoticon": "👸",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "princess",
                "emoticon": "👸🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "princess",
                "emoticon": "👸🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "princess",
                "emoticon": "👸🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "princess",
                "emoticon": "👸🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "princess",
                "emoticon": "👸🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "construction worker",
                "emoticon": "👷",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "construction worker",
                "emoticon": "👷🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "construction worker",
                "emoticon": "👷🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "construction worker",
                "emoticon": "👷🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "construction worker",
                "emoticon": "👷🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "construction worker",
                "emoticon": "👷🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man construction worker",
                "emoticon": "👷‍♂️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man construction worker",
                "emoticon": "👷🏻‍♂️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man construction worker",
                "emoticon": "👷🏼‍♂️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man construction worker",
                "emoticon": "👷🏽‍♂️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man construction worker",
                "emoticon": "👷🏾‍♂️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man construction worker",
                "emoticon": "👷🏿‍♂️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman construction worker",
                "emoticon": "👷‍♀️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman construction worker",
                "emoticon": "👷🏻‍♀️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman construction worker",
                "emoticon": "👷🏼‍♀️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman construction worker",
                "emoticon": "👷🏽‍♀️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman construction worker",
                "emoticon": "👷🏾‍♀️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman construction worker",
                "emoticon": "👷🏿‍♀️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "person wearing turban",
                "emoticon": "👳",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "person wearing turban",
                "emoticon": "👳🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "person wearing turban",
                "emoticon": "👳🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "person wearing turban",
                "emoticon": "👳🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "person wearing turban",
                "emoticon": "👳🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "person wearing turban",
                "emoticon": "👳🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man wearing turban",
                "emoticon": "👳‍♂️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man wearing turban",
                "emoticon": "👳🏻‍♂️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man wearing turban",
                "emoticon": "👳🏼‍♂️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man wearing turban",
                "emoticon": "👳🏽‍♂️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man wearing turban",
                "emoticon": "👳🏾‍♂️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man wearing turban",
                "emoticon": "👳🏿‍♂️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman wearing turban",
                "emoticon": "👳‍♀️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman wearing turban",
                "emoticon": "👳🏻‍♀️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman wearing turban",
                "emoticon": "👳🏼‍♀️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman wearing turban",
                "emoticon": "👳🏽‍♀️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman wearing turban",
                "emoticon": "👳🏾‍♀️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman wearing turban",
                "emoticon": "👳🏿‍♀️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "person with skullcap",
                "emoticon": "👲",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "person with skullcap",
                "emoticon": "👲🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "person with skullcap",
                "emoticon": "👲🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "person with skullcap",
                "emoticon": "👲🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "person with skullcap",
                "emoticon": "👲🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "person with skullcap",
                "emoticon": "👲🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "person with veil",
                "emoticon": "👰",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "person with veil",
                "emoticon": "👰🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "person with veil",
                "emoticon": "👰🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "person with veil",
                "emoticon": "👰🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "person with veil",
                "emoticon": "👰🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "person with veil",
                "emoticon": "👰🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man with veil",
                "emoticon": "👰‍♂️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man with veil",
                "emoticon": "👰🏻‍♂️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man with veil",
                "emoticon": "👰🏼‍♂️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man with veil",
                "emoticon": "👰🏽‍♂️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man with veil",
                "emoticon": "👰🏾‍♂️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man with veil",
                "emoticon": "👰🏿‍♂️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman with veil",
                "emoticon": "👰‍♀️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman with veil",
                "emoticon": "👰🏻‍♀️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman with veil",
                "emoticon": "👰🏼‍♀️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman with veil",
                "emoticon": "👰🏽‍♀️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman with veil",
                "emoticon": "👰🏾‍♀️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman with veil",
                "emoticon": "👰🏿‍♀️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "police officer",
                "emoticon": "👮",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "police officer",
                "emoticon": "👮🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "police officer",
                "emoticon": "👮🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "police officer",
                "emoticon": "👮🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "police officer",
                "emoticon": "👮🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "police officer",
                "emoticon": "👮🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man police officer",
                "emoticon": "👮‍♂️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man police officer",
                "emoticon": "👮🏻‍♂️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man police officer",
                "emoticon": "👮🏼‍♂️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man police officer",
                "emoticon": "👮🏽‍♂️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man police officer",
                "emoticon": "👮🏾‍♂️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man police officer",
                "emoticon": "👮🏿‍♂️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman police officer",
                "emoticon": "👮‍♀️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman police officer",
                "emoticon": "👮🏻‍♀️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman police officer",
                "emoticon": "👮🏼‍♀️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman police officer",
                "emoticon": "👮🏽‍♀️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman police officer",
                "emoticon": "👮🏾‍♀️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman police officer",
                "emoticon": "👮🏿‍♀️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman health worker",
                "emoticon": "👩‍⚕️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman health worker",
                "emoticon": "👩🏻‍⚕️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman health worker",
                "emoticon": "👩🏼‍⚕️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman health worker",
                "emoticon": "👩🏽‍⚕️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman health worker",
                "emoticon": "👩🏾‍⚕️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman health worker",
                "emoticon": "👩🏿‍⚕️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman student",
                "emoticon": "👩‍🎓",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman student",
                "emoticon": "👩🏻‍🎓",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman student",
                "emoticon": "👩🏼‍🎓",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman student",
                "emoticon": "👩🏽‍🎓",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman student",
                "emoticon": "👩🏾‍🎓",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman student",
                "emoticon": "👩🏿‍🎓",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman teacher",
                "emoticon": "👩‍🏫",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman teacher",
                "emoticon": "👩🏻‍🏫",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman teacher",
                "emoticon": "👩🏼‍🏫",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman teacher",
                "emoticon": "👩🏽‍🏫",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman teacher",
                "emoticon": "👩🏾‍🏫",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman teacher",
                "emoticon": "👩🏿‍🏫",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman judge",
                "emoticon": "👩‍⚖️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman judge",
                "emoticon": "👩🏻‍⚖️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman judge",
                "emoticon": "👩🏼‍⚖️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman judge",
                "emoticon": "👩🏽‍⚖️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman judge",
                "emoticon": "👩🏾‍⚖️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman judge",
                "emoticon": "👩🏿‍⚖️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman farmer",
                "emoticon": "👩‍🌾",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman farmer",
                "emoticon": "👩🏻‍🌾",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman farmer",
                "emoticon": "👩🏼‍🌾",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman farmer",
                "emoticon": "👩🏽‍🌾",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman farmer",
                "emoticon": "👩🏾‍🌾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman farmer",
                "emoticon": "👩🏿‍🌾",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman cook",
                "emoticon": "👩‍🍳",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman cook",
                "emoticon": "👩🏻‍🍳",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman cook",
                "emoticon": "👩🏼‍🍳",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman cook",
                "emoticon": "👩🏽‍🍳",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman cook",
                "emoticon": "👩🏾‍🍳",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman cook",
                "emoticon": "👩🏿‍🍳",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman mechanic",
                "emoticon": "👩‍🔧",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman mechanic",
                "emoticon": "👩🏻‍🔧",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman mechanic",
                "emoticon": "👩🏼‍🔧",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman mechanic",
                "emoticon": "👩🏽‍🔧",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman mechanic",
                "emoticon": "👩🏾‍🔧",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman mechanic",
                "emoticon": "👩🏿‍🔧",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman factory worker",
                "emoticon": "👩‍🏭",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman factory worker",
                "emoticon": "👩🏻‍🏭",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman factory worker",
                "emoticon": "👩🏼‍🏭",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman factory worker",
                "emoticon": "👩🏽‍🏭",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman factory worker",
                "emoticon": "👩🏾‍🏭",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman factory worker",
                "emoticon": "👩🏿‍🏭",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman office worker",
                "emoticon": "👩‍💼",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman office worker",
                "emoticon": "👩🏻‍💼",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman office worker",
                "emoticon": "👩🏼‍💼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman office worker",
                "emoticon": "👩🏽‍💼",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman office worker",
                "emoticon": "👩🏾‍💼",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman office worker",
                "emoticon": "👩🏿‍💼",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman scientist",
                "emoticon": "👩‍🔬",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman scientist",
                "emoticon": "👩🏻‍🔬",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman scientist",
                "emoticon": "👩🏼‍🔬",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman scientist",
                "emoticon": "👩🏽‍🔬",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman scientist",
                "emoticon": "👩🏾‍🔬",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman scientist",
                "emoticon": "👩🏿‍🔬",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman technologist",
                "emoticon": "👩‍💻",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman technologist",
                "emoticon": "👩🏻‍💻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman technologist",
                "emoticon": "👩🏼‍💻",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman technologist",
                "emoticon": "👩🏽‍💻",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman technologist",
                "emoticon": "👩🏾‍💻",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman technologist",
                "emoticon": "👩🏿‍💻",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman singer",
                "emoticon": "👩‍🎤",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman singer",
                "emoticon": "👩🏻‍🎤",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman singer",
                "emoticon": "👩🏼‍🎤",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman singer",
                "emoticon": "👩🏽‍🎤",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman singer",
                "emoticon": "👩🏾‍🎤",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman singer",
                "emoticon": "👩🏿‍🎤",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman artist",
                "emoticon": "👩‍🎨",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman artist",
                "emoticon": "👩🏻‍🎨",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman artist",
                "emoticon": "👩🏼‍🎨",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman artist",
                "emoticon": "👩🏽‍🎨",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman artist",
                "emoticon": "👩🏾‍🎨",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman artist",
                "emoticon": "👩🏿‍🎨",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman pilot",
                "emoticon": "👩‍✈️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman pilot",
                "emoticon": "👩🏻‍✈️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman pilot",
                "emoticon": "👩🏼‍✈️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman pilot",
                "emoticon": "👩🏽‍✈️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman pilot",
                "emoticon": "👩🏾‍✈️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman pilot",
                "emoticon": "👩🏿‍✈️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman astronaut",
                "emoticon": "👩‍🚀",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman astronaut",
                "emoticon": "👩🏻‍🚀",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman astronaut",
                "emoticon": "👩🏼‍🚀",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman astronaut",
                "emoticon": "👩🏽‍🚀",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman astronaut",
                "emoticon": "👩🏾‍🚀",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman astronaut",
                "emoticon": "👩🏿‍🚀",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman firefighter",
                "emoticon": "👩‍🚒",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman firefighter",
                "emoticon": "👩🏻‍🚒",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman firefighter",
                "emoticon": "👩🏼‍🚒",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman firefighter",
                "emoticon": "👩🏽‍🚒",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman firefighter",
                "emoticon": "👩🏾‍🚒",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman firefighter",
                "emoticon": "👩🏿‍🚒",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman feeding baby",
                "emoticon": "👩‍🍼",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman feeding baby",
                "emoticon": "👩🏻‍🍼",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman feeding baby",
                "emoticon": "👩🏼‍🍼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman feeding baby",
                "emoticon": "👩🏽‍🍼",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman feeding baby",
                "emoticon": "👩🏾‍🍼",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "woman feeding baby",
                "emoticon": "👩🏿‍🍼",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man health worker",
                "emoticon": "👨‍⚕️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man health worker",
                "emoticon": "👨🏻‍⚕️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man health worker",
                "emoticon": "👨🏼‍⚕️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man health worker",
                "emoticon": "👨🏽‍⚕️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man health worker",
                "emoticon": "👨🏾‍⚕️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man health worker",
                "emoticon": "👨🏿‍⚕️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man student",
                "emoticon": "👨‍🎓",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man student",
                "emoticon": "👨🏻‍🎓",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man student",
                "emoticon": "👨🏼‍🎓",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man student",
                "emoticon": "👨🏽‍🎓",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man student",
                "emoticon": "👨🏾‍🎓",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man student",
                "emoticon": "👨🏿‍🎓",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man teacher",
                "emoticon": "👨‍🏫",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man teacher",
                "emoticon": "👨🏻‍🏫",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man teacher",
                "emoticon": "👨🏼‍🏫",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man teacher",
                "emoticon": "👨🏽‍🏫",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man teacher",
                "emoticon": "👨🏾‍🏫",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man teacher",
                "emoticon": "👨🏿‍🏫",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man judge",
                "emoticon": "👨‍⚖️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man judge",
                "emoticon": "👨🏻‍⚖️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man judge",
                "emoticon": "👨🏼‍⚖️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man judge",
                "emoticon": "👨🏽‍⚖️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man judge",
                "emoticon": "👨🏾‍⚖️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man judge",
                "emoticon": "👨🏿‍⚖️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man farmer",
                "emoticon": "👨‍🌾",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man farmer",
                "emoticon": "👨🏻‍🌾",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man farmer",
                "emoticon": "👨🏼‍🌾",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man farmer",
                "emoticon": "👨🏽‍🌾",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man farmer",
                "emoticon": "👨🏾‍🌾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man farmer",
                "emoticon": "👨🏿‍🌾",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man cook",
                "emoticon": "👨‍🍳",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man cook",
                "emoticon": "👨🏻‍🍳",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man cook",
                "emoticon": "👨🏼‍🍳",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man cook",
                "emoticon": "👨🏽‍🍳",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man cook",
                "emoticon": "👨🏾‍🍳",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man cook",
                "emoticon": "👨🏿‍🍳",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man mechanic",
                "emoticon": "👨‍🔧",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man mechanic",
                "emoticon": "👨🏻‍🔧",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man mechanic",
                "emoticon": "👨🏼‍🔧",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man mechanic",
                "emoticon": "👨🏽‍🔧",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man mechanic",
                "emoticon": "👨🏾‍🔧",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man mechanic",
                "emoticon": "👨🏿‍🔧",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man factory worker",
                "emoticon": "👨‍🏭",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man factory worker",
                "emoticon": "👨🏻‍🏭",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man factory worker",
                "emoticon": "👨🏼‍🏭",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man factory worker",
                "emoticon": "👨🏽‍🏭",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man factory worker",
                "emoticon": "👨🏾‍🏭",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man factory worker",
                "emoticon": "👨🏿‍🏭",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man office worker",
                "emoticon": "👨‍💼",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man office worker",
                "emoticon": "👨🏻‍💼",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man office worker",
                "emoticon": "👨🏼‍💼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man office worker",
                "emoticon": "👨🏽‍💼",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man office worker",
                "emoticon": "👨🏾‍💼",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man office worker",
                "emoticon": "👨🏿‍💼",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man scientist",
                "emoticon": "👨‍🔬",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man scientist",
                "emoticon": "👨🏻‍🔬",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man scientist",
                "emoticon": "👨🏼‍🔬",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man scientist",
                "emoticon": "👨🏽‍🔬",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man scientist",
                "emoticon": "👨🏾‍🔬",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man scientist",
                "emoticon": "👨🏿‍🔬",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man technologist",
                "emoticon": "👨‍💻",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man technologist",
                "emoticon": "👨🏻‍💻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man technologist",
                "emoticon": "👨🏼‍💻",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man technologist",
                "emoticon": "👨🏽‍💻",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man technologist",
                "emoticon": "👨🏾‍💻",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man technologist",
                "emoticon": "👨🏿‍💻",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man singer",
                "emoticon": "👨‍🎤",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man singer",
                "emoticon": "👨🏻‍🎤",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man singer",
                "emoticon": "👨🏼‍🎤",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man singer",
                "emoticon": "👨🏽‍🎤",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man singer",
                "emoticon": "👨🏾‍🎤",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man singer",
                "emoticon": "👨🏿‍🎤",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man artist",
                "emoticon": "👨‍🎨",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man artist",
                "emoticon": "👨🏻‍🎨",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man artist",
                "emoticon": "👨🏼‍🎨",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man artist",
                "emoticon": "👨🏽‍🎨",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man artist",
                "emoticon": "👨🏾‍🎨",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man artist",
                "emoticon": "👨🏿‍🎨",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man pilot",
                "emoticon": "👨‍✈️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man pilot",
                "emoticon": "👨🏻‍✈️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man pilot",
                "emoticon": "👨🏼‍✈️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man pilot",
                "emoticon": "👨🏽‍✈️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man pilot",
                "emoticon": "👨🏾‍✈️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man pilot",
                "emoticon": "👨🏿‍✈️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man astronaut",
                "emoticon": "👨‍🚀",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man astronaut",
                "emoticon": "👨🏻‍🚀",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man astronaut",
                "emoticon": "👨🏼‍🚀",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man astronaut",
                "emoticon": "👨🏽‍🚀",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man astronaut",
                "emoticon": "👨🏾‍🚀",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man astronaut",
                "emoticon": "👨🏿‍🚀",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man firefighter",
                "emoticon": "👨‍🚒",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man firefighter",
                "emoticon": "👨🏻‍🚒",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man firefighter",
                "emoticon": "👨🏼‍🚒",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man firefighter",
                "emoticon": "👨🏽‍🚒",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man firefighter",
                "emoticon": "👨🏾‍🚒",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man firefighter",
                "emoticon": "👨🏿‍🚒",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man feeding baby",
                "emoticon": "👨‍🍼",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man feeding baby",
                "emoticon": "👨🏻‍🍼",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man feeding baby",
                "emoticon": "👨🏼‍🍼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man feeding baby",
                "emoticon": "👨🏽‍🍼",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man feeding baby",
                "emoticon": "👨🏾‍🍼",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            },
            {
                "description": "man feeding baby",
                "emoticon": "👨🏿‍🍼",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-role"
            }
        ],
        "person-fantasy": [
            {
                "description": "zombie",
                "emoticon": "🧟",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "man zombie",
                "emoticon": "🧟‍♂️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "woman zombie",
                "emoticon": "🧟‍♀️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "genie",
                "emoticon": "🧞",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "man genie",
                "emoticon": "🧞‍♂️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "woman genie",
                "emoticon": "🧞‍♀️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "elf",
                "emoticon": "🧝",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "elf",
                "emoticon": "🧝🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "elf",
                "emoticon": "🧝🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "elf",
                "emoticon": "🧝🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "elf",
                "emoticon": "🧝🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "elf",
                "emoticon": "🧝🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "man elf",
                "emoticon": "🧝‍♂️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "man elf",
                "emoticon": "🧝🏻‍♂️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "man elf",
                "emoticon": "🧝🏼‍♂️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "man elf",
                "emoticon": "🧝🏽‍♂️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "man elf",
                "emoticon": "🧝🏾‍♂️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "man elf",
                "emoticon": "🧝🏿‍♂️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "woman elf",
                "emoticon": "🧝‍♀️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "woman elf",
                "emoticon": "🧝🏻‍♀️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "woman elf",
                "emoticon": "🧝🏼‍♀️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "woman elf",
                "emoticon": "🧝🏽‍♀️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "woman elf",
                "emoticon": "🧝🏾‍♀️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "woman elf",
                "emoticon": "🧝🏿‍♀️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "merperson",
                "emoticon": "🧜",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "merperson",
                "emoticon": "🧜🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "merperson",
                "emoticon": "🧜🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "merperson",
                "emoticon": "🧜🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "merperson",
                "emoticon": "🧜🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "merperson",
                "emoticon": "🧜🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "merman",
                "emoticon": "🧜‍♂️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "merman",
                "emoticon": "🧜🏻‍♂️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "merman",
                "emoticon": "🧜🏼‍♂️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "merman",
                "emoticon": "🧜🏽‍♂️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "merman",
                "emoticon": "🧜🏾‍♂️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "merman",
                "emoticon": "🧜🏿‍♂️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "mermaid",
                "emoticon": "🧜‍♀️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "mermaid",
                "emoticon": "🧜🏻‍♀️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "mermaid",
                "emoticon": "🧜🏼‍♀️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "mermaid",
                "emoticon": "🧜🏽‍♀️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "mermaid",
                "emoticon": "🧜🏾‍♀️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "mermaid",
                "emoticon": "🧜🏿‍♀️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "vampire",
                "emoticon": "🧛",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "vampire",
                "emoticon": "🧛🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "vampire",
                "emoticon": "🧛🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "vampire",
                "emoticon": "🧛🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "vampire",
                "emoticon": "🧛🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "vampire",
                "emoticon": "🧛🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "man vampire",
                "emoticon": "🧛‍♂️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "man vampire",
                "emoticon": "🧛🏻‍♂️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "man vampire",
                "emoticon": "🧛🏼‍♂️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "man vampire",
                "emoticon": "🧛🏽‍♂️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "man vampire",
                "emoticon": "🧛🏾‍♂️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "man vampire",
                "emoticon": "🧛🏿‍♂️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "woman vampire",
                "emoticon": "🧛‍♀️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "woman vampire",
                "emoticon": "🧛🏻‍♀️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "woman vampire",
                "emoticon": "🧛🏼‍♀️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "woman vampire",
                "emoticon": "🧛🏽‍♀️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "woman vampire",
                "emoticon": "🧛🏾‍♀️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "woman vampire",
                "emoticon": "🧛🏿‍♀️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "fairy",
                "emoticon": "🧚",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "fairy",
                "emoticon": "🧚🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "fairy",
                "emoticon": "🧚🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "fairy",
                "emoticon": "🧚🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "fairy",
                "emoticon": "🧚🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "fairy",
                "emoticon": "🧚🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "man fairy",
                "emoticon": "🧚‍♂️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "man fairy",
                "emoticon": "🧚🏻‍♂️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "man fairy",
                "emoticon": "🧚🏼‍♂️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "man fairy",
                "emoticon": "🧚🏽‍♂️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "man fairy",
                "emoticon": "🧚🏾‍♂️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "man fairy",
                "emoticon": "🧚🏿‍♂️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "woman fairy",
                "emoticon": "🧚‍♀️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "woman fairy",
                "emoticon": "🧚🏻‍♀️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "woman fairy",
                "emoticon": "🧚🏼‍♀️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "woman fairy",
                "emoticon": "🧚🏽‍♀️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "woman fairy",
                "emoticon": "🧚🏾‍♀️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "woman fairy",
                "emoticon": "🧚🏿‍♀️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "mage",
                "emoticon": "🧙",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "mage",
                "emoticon": "🧙🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "mage",
                "emoticon": "🧙🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "mage",
                "emoticon": "🧙🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "mage",
                "emoticon": "🧙🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "mage",
                "emoticon": "🧙🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "man mage",
                "emoticon": "🧙‍♂️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "man mage",
                "emoticon": "🧙🏻‍♂️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "man mage",
                "emoticon": "🧙🏼‍♂️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "man mage",
                "emoticon": "🧙🏽‍♂️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "man mage",
                "emoticon": "🧙🏾‍♂️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "man mage",
                "emoticon": "🧙🏿‍♂️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "woman mage",
                "emoticon": "🧙‍♀️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "woman mage",
                "emoticon": "🧙🏻‍♀️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "woman mage",
                "emoticon": "🧙🏼‍♀️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "woman mage",
                "emoticon": "🧙🏽‍♀️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "woman mage",
                "emoticon": "🧙🏾‍♀️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "woman mage",
                "emoticon": "🧙🏿‍♀️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "mx claus",
                "emoticon": "🧑‍🎄",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "mx claus",
                "emoticon": "🧑🏻‍🎄",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "mx claus",
                "emoticon": "🧑🏼‍🎄",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "mx claus",
                "emoticon": "🧑🏽‍🎄",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "mx claus",
                "emoticon": "🧑🏾‍🎄",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "mx claus",
                "emoticon": "🧑🏿‍🎄",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "supervillain",
                "emoticon": "🦹",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "supervillain",
                "emoticon": "🦹🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "supervillain",
                "emoticon": "🦹🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "supervillain",
                "emoticon": "🦹🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "supervillain",
                "emoticon": "🦹🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "supervillain",
                "emoticon": "🦹🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "man supervillain",
                "emoticon": "🦹‍♂️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "man supervillain",
                "emoticon": "🦹🏻‍♂️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "man supervillain",
                "emoticon": "🦹🏼‍♂️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "man supervillain",
                "emoticon": "🦹🏽‍♂️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "man supervillain",
                "emoticon": "🦹🏾‍♂️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "man supervillain",
                "emoticon": "🦹🏿‍♂️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "woman supervillain",
                "emoticon": "🦹‍♀️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "woman supervillain",
                "emoticon": "🦹🏻‍♀️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "woman supervillain",
                "emoticon": "🦹🏼‍♀️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "woman supervillain",
                "emoticon": "🦹🏽‍♀️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "woman supervillain",
                "emoticon": "🦹🏾‍♀️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "woman supervillain",
                "emoticon": "🦹🏿‍♀️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "superhero",
                "emoticon": "🦸",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "superhero",
                "emoticon": "🦸🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "superhero",
                "emoticon": "🦸🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "superhero",
                "emoticon": "🦸🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "superhero",
                "emoticon": "🦸🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "superhero",
                "emoticon": "🦸🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "man superhero",
                "emoticon": "🦸‍♂️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "man superhero",
                "emoticon": "🦸🏻‍♂️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "man superhero",
                "emoticon": "🦸🏼‍♂️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "man superhero",
                "emoticon": "🦸🏽‍♂️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "man superhero",
                "emoticon": "🦸🏾‍♂️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "man superhero",
                "emoticon": "🦸🏿‍♂️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "woman superhero",
                "emoticon": "🦸‍♀️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "woman superhero",
                "emoticon": "🦸🏻‍♀️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "woman superhero",
                "emoticon": "🦸🏼‍♀️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "woman superhero",
                "emoticon": "🦸🏽‍♀️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "woman superhero",
                "emoticon": "🦸🏾‍♀️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "woman superhero",
                "emoticon": "🦸🏿‍♀️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "Mrs. Claus",
                "emoticon": "🤶",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "Mrs. Claus",
                "emoticon": "🤶🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "Mrs. Claus",
                "emoticon": "🤶🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "Mrs. Claus",
                "emoticon": "🤶🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "Mrs. Claus",
                "emoticon": "🤶🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "Mrs. Claus",
                "emoticon": "🤶🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "baby angel",
                "emoticon": "👼",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "baby angel",
                "emoticon": "👼🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "baby angel",
                "emoticon": "👼🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "baby angel",
                "emoticon": "👼🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "baby angel",
                "emoticon": "👼🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "baby angel",
                "emoticon": "👼🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "Santa Claus",
                "emoticon": "🎅",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "Santa Claus",
                "emoticon": "🎅🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "Santa Claus",
                "emoticon": "🎅🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "Santa Claus",
                "emoticon": "🎅🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "Santa Claus",
                "emoticon": "🎅🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            },
            {
                "description": "Santa Claus",
                "emoticon": "🎅🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-fantasy"
            }
        ],
        "person-activity": [
            {
                "description": "person climbing",
                "emoticon": "🧗",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "person climbing",
                "emoticon": "🧗🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "person climbing",
                "emoticon": "🧗🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "person climbing",
                "emoticon": "🧗🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "person climbing",
                "emoticon": "🧗🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "person climbing",
                "emoticon": "🧗🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "man climbing",
                "emoticon": "🧗‍♂️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "man climbing",
                "emoticon": "🧗🏻‍♂️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "man climbing",
                "emoticon": "🧗🏼‍♂️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "man climbing",
                "emoticon": "🧗🏽‍♂️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "man climbing",
                "emoticon": "🧗🏾‍♂️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "man climbing",
                "emoticon": "🧗🏿‍♂️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "woman climbing",
                "emoticon": "🧗‍♀️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "woman climbing",
                "emoticon": "🧗🏻‍♀️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "woman climbing",
                "emoticon": "🧗🏼‍♀️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "woman climbing",
                "emoticon": "🧗🏽‍♀️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "woman climbing",
                "emoticon": "🧗🏾‍♀️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "woman climbing",
                "emoticon": "🧗🏿‍♀️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "person in steamy room",
                "emoticon": "🧖",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "person in steamy room",
                "emoticon": "🧖🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "person in steamy room",
                "emoticon": "🧖🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "person in steamy room",
                "emoticon": "🧖🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "person in steamy room",
                "emoticon": "🧖🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "person in steamy room",
                "emoticon": "🧖🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "man in steamy room",
                "emoticon": "🧖‍♂️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "man in steamy room",
                "emoticon": "🧖🏻‍♂️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "man in steamy room",
                "emoticon": "🧖🏼‍♂️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "man in steamy room",
                "emoticon": "🧖🏽‍♂️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "man in steamy room",
                "emoticon": "🧖🏾‍♂️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "man in steamy room",
                "emoticon": "🧖🏿‍♂️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "woman in steamy room",
                "emoticon": "🧖‍♀️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "woman in steamy room",
                "emoticon": "🧖🏻‍♀️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "woman in steamy room",
                "emoticon": "🧖🏼‍♀️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "woman in steamy room",
                "emoticon": "🧖🏽‍♀️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "woman in steamy room",
                "emoticon": "🧖🏾‍♀️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "woman in steamy room",
                "emoticon": "🧖🏿‍♀️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "person with white cane",
                "emoticon": "🧑‍🦯",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "person with white cane",
                "emoticon": "🧑🏻‍🦯",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "person with white cane",
                "emoticon": "🧑🏼‍🦯",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "person with white cane",
                "emoticon": "🧑🏽‍🦯",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "person with white cane",
                "emoticon": "🧑🏾‍🦯",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "person with white cane",
                "emoticon": "🧑🏿‍🦯",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "person with white cane facing right",
                "emoticon": "🧑‍🦯‍➡️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "person with white cane facing right",
                "emoticon": "🧑🏻‍🦯‍➡️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "person with white cane facing right",
                "emoticon": "🧑🏼‍🦯‍➡️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "person with white cane facing right",
                "emoticon": "🧑🏽‍🦯‍➡️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "person with white cane facing right",
                "emoticon": "🧑🏾‍🦯‍➡️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "person with white cane facing right",
                "emoticon": "🧑🏿‍🦯‍➡️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "person in motorized wheelchair",
                "emoticon": "🧑‍🦼",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "person in motorized wheelchair",
                "emoticon": "🧑🏻‍🦼",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "person in motorized wheelchair",
                "emoticon": "🧑🏼‍🦼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "person in motorized wheelchair",
                "emoticon": "🧑🏽‍🦼",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "person in motorized wheelchair",
                "emoticon": "🧑🏾‍🦼",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "person in motorized wheelchair",
                "emoticon": "🧑🏿‍🦼",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "person in motorized wheelchair facing right",
                "emoticon": "🧑‍🦼‍➡️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "person in motorized wheelchair facing right",
                "emoticon": "🧑🏻‍🦼‍➡️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "person in motorized wheelchair facing right",
                "emoticon": "🧑🏼‍🦼‍➡️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "person in motorized wheelchair facing right",
                "emoticon": "🧑🏽‍🦼‍➡️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "person in motorized wheelchair facing right",
                "emoticon": "🧑🏾‍🦼‍➡️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "person in motorized wheelchair facing right",
                "emoticon": "🧑🏿‍🦼‍➡️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "person in manual wheelchair",
                "emoticon": "🧑‍🦽",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "person in manual wheelchair",
                "emoticon": "🧑🏻‍🦽",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "person in manual wheelchair",
                "emoticon": "🧑🏼‍🦽",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "person in manual wheelchair",
                "emoticon": "🧑🏽‍🦽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "person in manual wheelchair",
                "emoticon": "🧑🏾‍🦽",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "person in manual wheelchair",
                "emoticon": "🧑🏿‍🦽",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "person in manual wheelchair facing right",
                "emoticon": "🧑‍🦽‍➡️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "person in manual wheelchair facing right",
                "emoticon": "🧑🏻‍🦽‍➡️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "person in manual wheelchair facing right",
                "emoticon": "🧑🏼‍🦽‍➡️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "person in manual wheelchair facing right",
                "emoticon": "🧑🏽‍🦽‍➡️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "person in manual wheelchair facing right",
                "emoticon": "🧑🏾‍🦽‍➡️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "person in manual wheelchair facing right",
                "emoticon": "🧑🏿‍🦽‍➡️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "person kneeling",
                "emoticon": "🧎",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "person kneeling",
                "emoticon": "🧎🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "person kneeling",
                "emoticon": "🧎🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "person kneeling",
                "emoticon": "🧎🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "person kneeling",
                "emoticon": "🧎🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "person kneeling",
                "emoticon": "🧎🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "man kneeling",
                "emoticon": "🧎‍♂️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "man kneeling",
                "emoticon": "🧎🏻‍♂️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "man kneeling",
                "emoticon": "🧎🏼‍♂️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "man kneeling",
                "emoticon": "🧎🏽‍♂️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "man kneeling",
                "emoticon": "🧎🏾‍♂️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "man kneeling",
                "emoticon": "🧎🏿‍♂️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "woman kneeling",
                "emoticon": "🧎‍♀️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "woman kneeling",
                "emoticon": "🧎🏻‍♀️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "woman kneeling",
                "emoticon": "🧎🏼‍♀️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "woman kneeling",
                "emoticon": "🧎🏽‍♀️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "woman kneeling",
                "emoticon": "🧎🏾‍♀️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "woman kneeling",
                "emoticon": "🧎🏿‍♀️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "person kneeling facing right",
                "emoticon": "🧎‍➡️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "person kneeling facing right",
                "emoticon": "🧎🏻‍➡️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "person kneeling facing right",
                "emoticon": "🧎🏼‍➡️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "person kneeling facing right",
                "emoticon": "🧎🏽‍➡️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "person kneeling facing right",
                "emoticon": "🧎🏾‍➡️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "person kneeling facing right",
                "emoticon": "🧎🏿‍➡️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "woman kneeling facing right",
                "emoticon": "🧎‍♀️‍➡️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "woman kneeling facing right",
                "emoticon": "🧎🏻‍♀️‍➡️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "woman kneeling facing right",
                "emoticon": "🧎🏼‍♀️‍➡️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "woman kneeling facing right",
                "emoticon": "🧎🏽‍♀️‍➡️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "woman kneeling facing right",
                "emoticon": "🧎🏾‍♀️‍➡️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "woman kneeling facing right",
                "emoticon": "🧎🏿‍♀️‍➡️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "man kneeling facing right",
                "emoticon": "🧎‍♂️‍➡️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "man kneeling facing right",
                "emoticon": "🧎🏻‍♂️‍➡️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "man kneeling facing right",
                "emoticon": "🧎🏼‍♂️‍➡️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "man kneeling facing right",
                "emoticon": "🧎🏽‍♂️‍➡️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "man kneeling facing right",
                "emoticon": "🧎🏾‍♂️‍➡️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "man kneeling facing right",
                "emoticon": "🧎🏿‍♂️‍➡️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "person standing",
                "emoticon": "🧍",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "person standing",
                "emoticon": "🧍🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "person standing",
                "emoticon": "🧍🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "person standing",
                "emoticon": "🧍🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "person standing",
                "emoticon": "🧍🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "person standing",
                "emoticon": "🧍🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "man standing",
                "emoticon": "🧍‍♂️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "man standing",
                "emoticon": "🧍🏻‍♂️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "man standing",
                "emoticon": "🧍🏼‍♂️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "man standing",
                "emoticon": "🧍🏽‍♂️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "man standing",
                "emoticon": "🧍🏾‍♂️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "man standing",
                "emoticon": "🧍🏿‍♂️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "woman standing",
                "emoticon": "🧍‍♀️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "woman standing",
                "emoticon": "🧍🏻‍♀️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "woman standing",
                "emoticon": "🧍🏼‍♀️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "woman standing",
                "emoticon": "🧍🏽‍♀️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "woman standing",
                "emoticon": "🧍🏾‍♀️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "woman standing",
                "emoticon": "🧍🏿‍♀️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "person walking",
                "emoticon": "🚶",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "person walking",
                "emoticon": "🚶🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "person walking",
                "emoticon": "🚶🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "person walking",
                "emoticon": "🚶🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "person walking",
                "emoticon": "🚶🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "person walking",
                "emoticon": "🚶🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "man walking",
                "emoticon": "🚶‍♂️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "man walking",
                "emoticon": "🚶🏻‍♂️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "man walking",
                "emoticon": "🚶🏼‍♂️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "man walking",
                "emoticon": "🚶🏽‍♂️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "man walking",
                "emoticon": "🚶🏾‍♂️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "man walking",
                "emoticon": "🚶🏿‍♂️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "woman walking",
                "emoticon": "🚶‍♀️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "woman walking",
                "emoticon": "🚶🏻‍♀️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "woman walking",
                "emoticon": "🚶🏼‍♀️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "woman walking",
                "emoticon": "🚶🏽‍♀️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "woman walking",
                "emoticon": "🚶🏾‍♀️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "woman walking",
                "emoticon": "🚶🏿‍♀️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "person walking facing right",
                "emoticon": "🚶‍➡️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "person walking facing right",
                "emoticon": "🚶🏻‍➡️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "person walking facing right",
                "emoticon": "🚶🏼‍➡️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "person walking facing right",
                "emoticon": "🚶🏽‍➡️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "person walking facing right",
                "emoticon": "🚶🏾‍➡️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "person walking facing right",
                "emoticon": "🚶🏿‍➡️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "woman walking facing right",
                "emoticon": "🚶‍♀️‍➡️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "woman walking facing right",
                "emoticon": "🚶🏻‍♀️‍➡️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "woman walking facing right",
                "emoticon": "🚶🏼‍♀️‍➡️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "woman walking facing right",
                "emoticon": "🚶🏽‍♀️‍➡️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "woman walking facing right",
                "emoticon": "🚶🏾‍♀️‍➡️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "woman walking facing right",
                "emoticon": "🚶🏿‍♀️‍➡️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "man walking facing right",
                "emoticon": "🚶‍♂️‍➡️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "man walking facing right",
                "emoticon": "🚶🏻‍♂️‍➡️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "man walking facing right",
                "emoticon": "🚶🏼‍♂️‍➡️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "man walking facing right",
                "emoticon": "🚶🏽‍♂️‍➡️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "man walking facing right",
                "emoticon": "🚶🏾‍♂️‍➡️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "man walking facing right",
                "emoticon": "🚶🏿‍♂️‍➡️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "man dancing",
                "emoticon": "🕺",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "man dancing",
                "emoticon": "🕺🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "man dancing",
                "emoticon": "🕺🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "man dancing",
                "emoticon": "🕺🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "man dancing",
                "emoticon": "🕺🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "man dancing",
                "emoticon": "🕺🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "person in suit levitating",
                "emoticon": "🕴️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "person in suit levitating",
                "emoticon": "🕴🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "person in suit levitating",
                "emoticon": "🕴🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "person in suit levitating",
                "emoticon": "🕴🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "person in suit levitating",
                "emoticon": "🕴🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "person in suit levitating",
                "emoticon": "🕴🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "person getting haircut",
                "emoticon": "💇",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "person getting haircut",
                "emoticon": "💇🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "person getting haircut",
                "emoticon": "💇🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "person getting haircut",
                "emoticon": "💇🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "person getting haircut",
                "emoticon": "💇🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "person getting haircut",
                "emoticon": "💇🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "man getting haircut",
                "emoticon": "💇‍♂️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "man getting haircut",
                "emoticon": "💇🏻‍♂️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "man getting haircut",
                "emoticon": "💇🏼‍♂️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "man getting haircut",
                "emoticon": "💇🏽‍♂️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "man getting haircut",
                "emoticon": "💇🏾‍♂️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "man getting haircut",
                "emoticon": "💇🏿‍♂️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "woman getting haircut",
                "emoticon": "💇‍♀️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "woman getting haircut",
                "emoticon": "💇🏻‍♀️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "woman getting haircut",
                "emoticon": "💇🏼‍♀️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "woman getting haircut",
                "emoticon": "💇🏽‍♀️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "woman getting haircut",
                "emoticon": "💇🏾‍♀️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "woman getting haircut",
                "emoticon": "💇🏿‍♀️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "person getting massage",
                "emoticon": "💆",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "person getting massage",
                "emoticon": "💆🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "person getting massage",
                "emoticon": "💆🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "person getting massage",
                "emoticon": "💆🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "person getting massage",
                "emoticon": "💆🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "person getting massage",
                "emoticon": "💆🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "man getting massage",
                "emoticon": "💆‍♂️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "man getting massage",
                "emoticon": "💆🏻‍♂️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "man getting massage",
                "emoticon": "💆🏼‍♂️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "man getting massage",
                "emoticon": "💆🏽‍♂️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "man getting massage",
                "emoticon": "💆🏾‍♂️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "man getting massage",
                "emoticon": "💆🏿‍♂️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "woman getting massage",
                "emoticon": "💆‍♀️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "woman getting massage",
                "emoticon": "💆🏻‍♀️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "woman getting massage",
                "emoticon": "💆🏼‍♀️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "woman getting massage",
                "emoticon": "💆🏽‍♀️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "woman getting massage",
                "emoticon": "💆🏾‍♀️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "woman getting massage",
                "emoticon": "💆🏿‍♀️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "woman dancing",
                "emoticon": "💃",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "woman dancing",
                "emoticon": "💃🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "woman dancing",
                "emoticon": "💃🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "woman dancing",
                "emoticon": "💃🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "woman dancing",
                "emoticon": "💃🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "woman dancing",
                "emoticon": "💃🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "people with bunny ears",
                "emoticon": "👯",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "men with bunny ears",
                "emoticon": "👯‍♂️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "women with bunny ears",
                "emoticon": "👯‍♀️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "woman with white cane",
                "emoticon": "👩‍🦯",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "woman with white cane",
                "emoticon": "👩🏻‍🦯",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "woman with white cane",
                "emoticon": "👩🏼‍🦯",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "woman with white cane",
                "emoticon": "👩🏽‍🦯",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "woman with white cane",
                "emoticon": "👩🏾‍🦯",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "woman with white cane",
                "emoticon": "👩🏿‍🦯",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "woman with white cane facing right",
                "emoticon": "👩‍🦯‍➡️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "woman with white cane facing right",
                "emoticon": "👩🏻‍🦯‍➡️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "woman with white cane facing right",
                "emoticon": "👩🏼‍🦯‍➡️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "woman with white cane facing right",
                "emoticon": "👩🏽‍🦯‍➡️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "woman with white cane facing right",
                "emoticon": "👩🏾‍🦯‍➡️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "woman with white cane facing right",
                "emoticon": "👩🏿‍🦯‍➡️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "woman in motorized wheelchair",
                "emoticon": "👩‍🦼",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "woman in motorized wheelchair",
                "emoticon": "👩🏻‍🦼",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "woman in motorized wheelchair",
                "emoticon": "👩🏼‍🦼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "woman in motorized wheelchair",
                "emoticon": "👩🏽‍🦼",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "woman in motorized wheelchair",
                "emoticon": "👩🏾‍🦼",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "woman in motorized wheelchair",
                "emoticon": "👩🏿‍🦼",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "woman in motorized wheelchair facing right",
                "emoticon": "👩‍🦼‍➡️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "woman in motorized wheelchair facing right",
                "emoticon": "👩🏻‍🦼‍➡️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "woman in motorized wheelchair facing right",
                "emoticon": "👩🏼‍🦼‍➡️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "woman in motorized wheelchair facing right",
                "emoticon": "👩🏽‍🦼‍➡️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "woman in motorized wheelchair facing right",
                "emoticon": "👩🏾‍🦼‍➡️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "woman in motorized wheelchair facing right",
                "emoticon": "👩🏿‍🦼‍➡️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "woman in manual wheelchair",
                "emoticon": "👩‍🦽",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "woman in manual wheelchair",
                "emoticon": "👩🏻‍🦽",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "woman in manual wheelchair",
                "emoticon": "👩🏼‍🦽",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "woman in manual wheelchair",
                "emoticon": "👩🏽‍🦽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "woman in manual wheelchair",
                "emoticon": "👩🏾‍🦽",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "woman in manual wheelchair",
                "emoticon": "👩🏿‍🦽",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "woman in manual wheelchair facing right",
                "emoticon": "👩‍🦽‍➡️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "woman in manual wheelchair facing right",
                "emoticon": "👩🏻‍🦽‍➡️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "woman in manual wheelchair facing right",
                "emoticon": "👩🏼‍🦽‍➡️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "woman in manual wheelchair facing right",
                "emoticon": "👩🏽‍🦽‍➡️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "woman in manual wheelchair facing right",
                "emoticon": "👩🏾‍🦽‍➡️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "woman in manual wheelchair facing right",
                "emoticon": "👩🏿‍🦽‍➡️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "man with white cane",
                "emoticon": "👨‍🦯",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "man with white cane",
                "emoticon": "👨🏻‍🦯",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "man with white cane",
                "emoticon": "👨🏼‍🦯",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "man with white cane",
                "emoticon": "👨🏽‍🦯",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "man with white cane",
                "emoticon": "👨🏾‍🦯",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "man with white cane",
                "emoticon": "👨🏿‍🦯",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "man with white cane facing right",
                "emoticon": "👨‍🦯‍➡️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "man with white cane facing right",
                "emoticon": "👨🏻‍🦯‍➡️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "man with white cane facing right",
                "emoticon": "👨🏼‍🦯‍➡️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "man with white cane facing right",
                "emoticon": "👨🏽‍🦯‍➡️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "man with white cane facing right",
                "emoticon": "👨🏾‍🦯‍➡️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "man with white cane facing right",
                "emoticon": "👨🏿‍🦯‍➡️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "man in motorized wheelchair",
                "emoticon": "👨‍🦼",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "man in motorized wheelchair",
                "emoticon": "👨🏻‍🦼",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "man in motorized wheelchair",
                "emoticon": "👨🏼‍🦼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "man in motorized wheelchair",
                "emoticon": "👨🏽‍🦼",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "man in motorized wheelchair",
                "emoticon": "👨🏾‍🦼",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "man in motorized wheelchair",
                "emoticon": "👨🏿‍🦼",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "man in motorized wheelchair facing right",
                "emoticon": "👨‍🦼‍➡️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "man in motorized wheelchair facing right",
                "emoticon": "👨🏻‍🦼‍➡️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "man in motorized wheelchair facing right",
                "emoticon": "👨🏼‍🦼‍➡️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "man in motorized wheelchair facing right",
                "emoticon": "👨🏽‍🦼‍➡️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "man in motorized wheelchair facing right",
                "emoticon": "👨🏾‍🦼‍➡️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "man in motorized wheelchair facing right",
                "emoticon": "👨🏿‍🦼‍➡️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "man in manual wheelchair",
                "emoticon": "👨‍🦽",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "man in manual wheelchair",
                "emoticon": "👨🏻‍🦽",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "man in manual wheelchair",
                "emoticon": "👨🏼‍🦽",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "man in manual wheelchair",
                "emoticon": "👨🏽‍🦽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "man in manual wheelchair",
                "emoticon": "👨🏾‍🦽",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "man in manual wheelchair",
                "emoticon": "👨🏿‍🦽",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "man in manual wheelchair facing right",
                "emoticon": "👨‍🦽‍➡️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "man in manual wheelchair facing right",
                "emoticon": "👨🏻‍🦽‍➡️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "man in manual wheelchair facing right",
                "emoticon": "👨🏼‍🦽‍➡️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "man in manual wheelchair facing right",
                "emoticon": "👨🏽‍🦽‍➡️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "man in manual wheelchair facing right",
                "emoticon": "👨🏾‍🦽‍➡️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "man in manual wheelchair facing right",
                "emoticon": "👨🏿‍🦽‍➡️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "person running",
                "emoticon": "🏃",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "person running",
                "emoticon": "🏃🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "person running",
                "emoticon": "🏃🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "person running",
                "emoticon": "🏃🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "person running",
                "emoticon": "🏃🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "person running",
                "emoticon": "🏃🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "man running",
                "emoticon": "🏃‍♂️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "man running",
                "emoticon": "🏃🏻‍♂️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "man running",
                "emoticon": "🏃🏼‍♂️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "man running",
                "emoticon": "🏃🏽‍♂️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "man running",
                "emoticon": "🏃🏾‍♂️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "man running",
                "emoticon": "🏃🏿‍♂️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "woman running",
                "emoticon": "🏃‍♀️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "woman running",
                "emoticon": "🏃🏻‍♀️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "woman running",
                "emoticon": "🏃🏼‍♀️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "woman running",
                "emoticon": "🏃🏽‍♀️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "woman running",
                "emoticon": "🏃🏾‍♀️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "woman running",
                "emoticon": "🏃🏿‍♀️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "person running facing right",
                "emoticon": "🏃‍➡️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "person running facing right",
                "emoticon": "🏃🏻‍➡️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "person running facing right",
                "emoticon": "🏃🏼‍➡️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "person running facing right",
                "emoticon": "🏃🏽‍➡️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "person running facing right",
                "emoticon": "🏃🏾‍➡️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "person running facing right",
                "emoticon": "🏃🏿‍➡️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "woman running facing right",
                "emoticon": "🏃‍♀️‍➡️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "woman running facing right",
                "emoticon": "🏃🏻‍♀️‍➡️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "woman running facing right",
                "emoticon": "🏃🏼‍♀️‍➡️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "woman running facing right",
                "emoticon": "🏃🏽‍♀️‍➡️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "woman running facing right",
                "emoticon": "🏃🏾‍♀️‍➡️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "woman running facing right",
                "emoticon": "🏃🏿‍♀️‍➡️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "man running facing right",
                "emoticon": "🏃‍♂️‍➡️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "man running facing right",
                "emoticon": "🏃🏻‍♂️‍➡️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "man running facing right",
                "emoticon": "🏃🏼‍♂️‍➡️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "man running facing right",
                "emoticon": "🏃🏽‍♂️‍➡️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "man running facing right",
                "emoticon": "🏃🏾‍♂️‍➡️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            },
            {
                "description": "man running facing right",
                "emoticon": "🏃🏿‍♂️‍➡️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-activity"
            }
        ],
        "person-sport": [
            {
                "description": "person playing handball",
                "emoticon": "🤾",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "person playing handball",
                "emoticon": "🤾🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "person playing handball",
                "emoticon": "🤾🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "person playing handball",
                "emoticon": "🤾🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "person playing handball",
                "emoticon": "🤾🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "person playing handball",
                "emoticon": "🤾🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "man playing handball",
                "emoticon": "🤾‍♂️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "man playing handball",
                "emoticon": "🤾🏻‍♂️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "man playing handball",
                "emoticon": "🤾🏼‍♂️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "man playing handball",
                "emoticon": "🤾🏽‍♂️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "man playing handball",
                "emoticon": "🤾🏾‍♂️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "man playing handball",
                "emoticon": "🤾🏿‍♂️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "woman playing handball",
                "emoticon": "🤾‍♀️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "woman playing handball",
                "emoticon": "🤾🏻‍♀️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "woman playing handball",
                "emoticon": "🤾🏼‍♀️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "woman playing handball",
                "emoticon": "🤾🏽‍♀️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "woman playing handball",
                "emoticon": "🤾🏾‍♀️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "woman playing handball",
                "emoticon": "🤾🏿‍♀️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "person playing water polo",
                "emoticon": "🤽",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "person playing water polo",
                "emoticon": "🤽🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "person playing water polo",
                "emoticon": "🤽🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "person playing water polo",
                "emoticon": "🤽🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "person playing water polo",
                "emoticon": "🤽🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "person playing water polo",
                "emoticon": "🤽🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "man playing water polo",
                "emoticon": "🤽‍♂️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "man playing water polo",
                "emoticon": "🤽🏻‍♂️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "man playing water polo",
                "emoticon": "🤽🏼‍♂️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "man playing water polo",
                "emoticon": "🤽🏽‍♂️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "man playing water polo",
                "emoticon": "🤽🏾‍♂️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "man playing water polo",
                "emoticon": "🤽🏿‍♂️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "woman playing water polo",
                "emoticon": "🤽‍♀️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "woman playing water polo",
                "emoticon": "🤽🏻‍♀️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "woman playing water polo",
                "emoticon": "🤽🏼‍♀️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "woman playing water polo",
                "emoticon": "🤽🏽‍♀️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "woman playing water polo",
                "emoticon": "🤽🏾‍♀️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "woman playing water polo",
                "emoticon": "🤽🏿‍♀️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "people wrestling",
                "emoticon": "🤼",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "men wrestling",
                "emoticon": "🤼‍♂️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "women wrestling",
                "emoticon": "🤼‍♀️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "person fencing",
                "emoticon": "🤺",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "person juggling",
                "emoticon": "🤹",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "person juggling",
                "emoticon": "🤹🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "person juggling",
                "emoticon": "🤹🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "person juggling",
                "emoticon": "🤹🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "person juggling",
                "emoticon": "🤹🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "person juggling",
                "emoticon": "🤹🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "man juggling",
                "emoticon": "🤹‍♂️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "man juggling",
                "emoticon": "🤹🏻‍♂️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "man juggling",
                "emoticon": "🤹🏼‍♂️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "man juggling",
                "emoticon": "🤹🏽‍♂️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "man juggling",
                "emoticon": "🤹🏾‍♂️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "man juggling",
                "emoticon": "🤹🏿‍♂️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "woman juggling",
                "emoticon": "🤹‍♀️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "woman juggling",
                "emoticon": "🤹🏻‍♀️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "woman juggling",
                "emoticon": "🤹🏼‍♀️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "woman juggling",
                "emoticon": "🤹🏽‍♀️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "woman juggling",
                "emoticon": "🤹🏾‍♀️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "woman juggling",
                "emoticon": "🤹🏿‍♀️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "person cartwheeling",
                "emoticon": "🤸",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "person cartwheeling",
                "emoticon": "🤸🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "person cartwheeling",
                "emoticon": "🤸🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "person cartwheeling",
                "emoticon": "🤸🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "person cartwheeling",
                "emoticon": "🤸🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "person cartwheeling",
                "emoticon": "🤸🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "man cartwheeling",
                "emoticon": "🤸‍♂️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "man cartwheeling",
                "emoticon": "🤸🏻‍♂️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "man cartwheeling",
                "emoticon": "🤸🏼‍♂️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "man cartwheeling",
                "emoticon": "🤸🏽‍♂️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "man cartwheeling",
                "emoticon": "🤸🏾‍♂️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "man cartwheeling",
                "emoticon": "🤸🏿‍♂️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "woman cartwheeling",
                "emoticon": "🤸‍♀️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "woman cartwheeling",
                "emoticon": "🤸🏻‍♀️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "woman cartwheeling",
                "emoticon": "🤸🏼‍♀️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "woman cartwheeling",
                "emoticon": "🤸🏽‍♀️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "woman cartwheeling",
                "emoticon": "🤸🏾‍♀️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "woman cartwheeling",
                "emoticon": "🤸🏿‍♀️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "person mountain biking",
                "emoticon": "🚵",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "person mountain biking",
                "emoticon": "🚵🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "person mountain biking",
                "emoticon": "🚵🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "person mountain biking",
                "emoticon": "🚵🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "person mountain biking",
                "emoticon": "🚵🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "person mountain biking",
                "emoticon": "🚵🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "man mountain biking",
                "emoticon": "🚵‍♂️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "man mountain biking",
                "emoticon": "🚵🏻‍♂️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "man mountain biking",
                "emoticon": "🚵🏼‍♂️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "man mountain biking",
                "emoticon": "🚵🏽‍♂️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "man mountain biking",
                "emoticon": "🚵🏾‍♂️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "man mountain biking",
                "emoticon": "🚵🏿‍♂️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "woman mountain biking",
                "emoticon": "🚵‍♀️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "woman mountain biking",
                "emoticon": "🚵🏻‍♀️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "woman mountain biking",
                "emoticon": "🚵🏼‍♀️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "woman mountain biking",
                "emoticon": "🚵🏽‍♀️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "woman mountain biking",
                "emoticon": "🚵🏾‍♀️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "woman mountain biking",
                "emoticon": "🚵🏿‍♀️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "person biking",
                "emoticon": "🚴",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "person biking",
                "emoticon": "🚴🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "person biking",
                "emoticon": "🚴🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "person biking",
                "emoticon": "🚴🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "person biking",
                "emoticon": "🚴🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "person biking",
                "emoticon": "🚴🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "man biking",
                "emoticon": "🚴‍♂️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "man biking",
                "emoticon": "🚴🏻‍♂️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "man biking",
                "emoticon": "🚴🏼‍♂️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "man biking",
                "emoticon": "🚴🏽‍♂️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "man biking",
                "emoticon": "🚴🏾‍♂️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "man biking",
                "emoticon": "🚴🏿‍♂️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "woman biking",
                "emoticon": "🚴‍♀️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "woman biking",
                "emoticon": "🚴🏻‍♀️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "woman biking",
                "emoticon": "🚴🏼‍♀️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "woman biking",
                "emoticon": "🚴🏽‍♀️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "woman biking",
                "emoticon": "🚴🏾‍♀️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "woman biking",
                "emoticon": "🚴🏿‍♀️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "person rowing boat",
                "emoticon": "🚣",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "person rowing boat",
                "emoticon": "🚣🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "person rowing boat",
                "emoticon": "🚣🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "person rowing boat",
                "emoticon": "🚣🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "person rowing boat",
                "emoticon": "🚣🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "person rowing boat",
                "emoticon": "🚣🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "man rowing boat",
                "emoticon": "🚣‍♂️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "man rowing boat",
                "emoticon": "🚣🏻‍♂️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "man rowing boat",
                "emoticon": "🚣🏼‍♂️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "man rowing boat",
                "emoticon": "🚣🏽‍♂️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "man rowing boat",
                "emoticon": "🚣🏾‍♂️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "man rowing boat",
                "emoticon": "🚣🏿‍♂️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "woman rowing boat",
                "emoticon": "🚣‍♀️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "woman rowing boat",
                "emoticon": "🚣🏻‍♀️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "woman rowing boat",
                "emoticon": "🚣🏼‍♀️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "woman rowing boat",
                "emoticon": "🚣🏽‍♀️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "woman rowing boat",
                "emoticon": "🚣🏾‍♀️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "woman rowing boat",
                "emoticon": "🚣🏿‍♀️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "person golfing",
                "emoticon": "🏌️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "person golfing",
                "emoticon": "🏌🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "person golfing",
                "emoticon": "🏌🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "person golfing",
                "emoticon": "🏌🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "person golfing",
                "emoticon": "🏌🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "person golfing",
                "emoticon": "🏌🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "man golfing",
                "emoticon": "🏌️‍♂️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "man golfing",
                "emoticon": "🏌🏻‍♂️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "man golfing",
                "emoticon": "🏌🏼‍♂️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "man golfing",
                "emoticon": "🏌🏽‍♂️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "man golfing",
                "emoticon": "🏌🏾‍♂️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "man golfing",
                "emoticon": "🏌🏿‍♂️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "woman golfing",
                "emoticon": "🏌️‍♀️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "woman golfing",
                "emoticon": "🏌🏻‍♀️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "woman golfing",
                "emoticon": "🏌🏼‍♀️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "woman golfing",
                "emoticon": "🏌🏽‍♀️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "woman golfing",
                "emoticon": "🏌🏾‍♀️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "woman golfing",
                "emoticon": "🏌🏿‍♀️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "person lifting weights",
                "emoticon": "🏋️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "person lifting weights",
                "emoticon": "🏋🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "person lifting weights",
                "emoticon": "🏋🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "person lifting weights",
                "emoticon": "🏋🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "person lifting weights",
                "emoticon": "🏋🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "person lifting weights",
                "emoticon": "🏋🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "man lifting weights",
                "emoticon": "🏋️‍♂️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "man lifting weights",
                "emoticon": "🏋🏻‍♂️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "man lifting weights",
                "emoticon": "🏋🏼‍♂️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "man lifting weights",
                "emoticon": "🏋🏽‍♂️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "man lifting weights",
                "emoticon": "🏋🏾‍♂️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "man lifting weights",
                "emoticon": "🏋🏿‍♂️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "woman lifting weights",
                "emoticon": "🏋️‍♀️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "woman lifting weights",
                "emoticon": "🏋🏻‍♀️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "woman lifting weights",
                "emoticon": "🏋🏼‍♀️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "woman lifting weights",
                "emoticon": "🏋🏽‍♀️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "woman lifting weights",
                "emoticon": "🏋🏾‍♀️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "woman lifting weights",
                "emoticon": "🏋🏿‍♀️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "person swimming",
                "emoticon": "🏊",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "person swimming",
                "emoticon": "🏊🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "person swimming",
                "emoticon": "🏊🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "person swimming",
                "emoticon": "🏊🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "person swimming",
                "emoticon": "🏊🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "person swimming",
                "emoticon": "🏊🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "man swimming",
                "emoticon": "🏊‍♂️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "man swimming",
                "emoticon": "🏊🏻‍♂️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "man swimming",
                "emoticon": "🏊🏼‍♂️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "man swimming",
                "emoticon": "🏊🏽‍♂️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "man swimming",
                "emoticon": "🏊🏾‍♂️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "man swimming",
                "emoticon": "🏊🏿‍♂️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "woman swimming",
                "emoticon": "🏊‍♀️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "woman swimming",
                "emoticon": "🏊🏻‍♀️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "woman swimming",
                "emoticon": "🏊🏼‍♀️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "woman swimming",
                "emoticon": "🏊🏽‍♀️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "woman swimming",
                "emoticon": "🏊🏾‍♀️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "woman swimming",
                "emoticon": "🏊🏿‍♀️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "horse racing",
                "emoticon": "🏇",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "horse racing",
                "emoticon": "🏇🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "horse racing",
                "emoticon": "🏇🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "horse racing",
                "emoticon": "🏇🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "horse racing",
                "emoticon": "🏇🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "horse racing",
                "emoticon": "🏇🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "person surfing",
                "emoticon": "🏄",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "person surfing",
                "emoticon": "🏄🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "person surfing",
                "emoticon": "🏄🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "person surfing",
                "emoticon": "🏄🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "person surfing",
                "emoticon": "🏄🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "person surfing",
                "emoticon": "🏄🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "man surfing",
                "emoticon": "🏄‍♂️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "man surfing",
                "emoticon": "🏄🏻‍♂️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "man surfing",
                "emoticon": "🏄🏼‍♂️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "man surfing",
                "emoticon": "🏄🏽‍♂️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "man surfing",
                "emoticon": "🏄🏾‍♂️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "man surfing",
                "emoticon": "🏄🏿‍♂️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "woman surfing",
                "emoticon": "🏄‍♀️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "woman surfing",
                "emoticon": "🏄🏻‍♀️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "woman surfing",
                "emoticon": "🏄🏼‍♀️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "woman surfing",
                "emoticon": "🏄🏽‍♀️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "woman surfing",
                "emoticon": "🏄🏾‍♀️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "woman surfing",
                "emoticon": "🏄🏿‍♀️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "snowboarder",
                "emoticon": "🏂",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "snowboarder",
                "emoticon": "🏂🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "snowboarder",
                "emoticon": "🏂🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "snowboarder",
                "emoticon": "🏂🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "snowboarder",
                "emoticon": "🏂🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "snowboarder",
                "emoticon": "🏂🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "person bouncing ball",
                "emoticon": "⛹️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "person bouncing ball",
                "emoticon": "⛹🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "person bouncing ball",
                "emoticon": "⛹🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "person bouncing ball",
                "emoticon": "⛹🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "person bouncing ball",
                "emoticon": "⛹🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "person bouncing ball",
                "emoticon": "⛹🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "man bouncing ball",
                "emoticon": "⛹️‍♂️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "man bouncing ball",
                "emoticon": "⛹🏻‍♂️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "man bouncing ball",
                "emoticon": "⛹🏼‍♂️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "man bouncing ball",
                "emoticon": "⛹🏽‍♂️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "man bouncing ball",
                "emoticon": "⛹🏾‍♂️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "man bouncing ball",
                "emoticon": "⛹🏿‍♂️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "woman bouncing ball",
                "emoticon": "⛹️‍♀️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "woman bouncing ball",
                "emoticon": "⛹🏻‍♀️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "woman bouncing ball",
                "emoticon": "⛹🏼‍♀️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "woman bouncing ball",
                "emoticon": "⛹🏽‍♀️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "woman bouncing ball",
                "emoticon": "⛹🏾‍♀️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "woman bouncing ball",
                "emoticon": "⛹🏿‍♀️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            },
            {
                "description": "skier",
                "emoticon": "⛷️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-sport"
            }
        ],
        "person-resting": [
            {
                "description": "person in lotus position",
                "emoticon": "🧘",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-resting"
            },
            {
                "description": "person in lotus position",
                "emoticon": "🧘🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-resting"
            },
            {
                "description": "person in lotus position",
                "emoticon": "🧘🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-resting"
            },
            {
                "description": "person in lotus position",
                "emoticon": "🧘🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-resting"
            },
            {
                "description": "person in lotus position",
                "emoticon": "🧘🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-resting"
            },
            {
                "description": "person in lotus position",
                "emoticon": "🧘🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-resting"
            },
            {
                "description": "man in lotus position",
                "emoticon": "🧘‍♂️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-resting"
            },
            {
                "description": "man in lotus position",
                "emoticon": "🧘🏻‍♂️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-resting"
            },
            {
                "description": "man in lotus position",
                "emoticon": "🧘🏼‍♂️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-resting"
            },
            {
                "description": "man in lotus position",
                "emoticon": "🧘🏽‍♂️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-resting"
            },
            {
                "description": "man in lotus position",
                "emoticon": "🧘🏾‍♂️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-resting"
            },
            {
                "description": "man in lotus position",
                "emoticon": "🧘🏿‍♂️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-resting"
            },
            {
                "description": "woman in lotus position",
                "emoticon": "🧘‍♀️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-resting"
            },
            {
                "description": "woman in lotus position",
                "emoticon": "🧘🏻‍♀️",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-resting"
            },
            {
                "description": "woman in lotus position",
                "emoticon": "🧘🏼‍♀️",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-resting"
            },
            {
                "description": "woman in lotus position",
                "emoticon": "🧘🏽‍♀️",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-resting"
            },
            {
                "description": "woman in lotus position",
                "emoticon": "🧘🏾‍♀️",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-resting"
            },
            {
                "description": "woman in lotus position",
                "emoticon": "🧘🏿‍♀️",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-resting"
            },
            {
                "description": "person in bed",
                "emoticon": "🛌",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-resting"
            },
            {
                "description": "person in bed",
                "emoticon": "🛌🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-resting"
            },
            {
                "description": "person in bed",
                "emoticon": "🛌🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-resting"
            },
            {
                "description": "person in bed",
                "emoticon": "🛌🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-resting"
            },
            {
                "description": "person in bed",
                "emoticon": "🛌🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-resting"
            },
            {
                "description": "person in bed",
                "emoticon": "🛌🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-resting"
            },
            {
                "description": "person taking bath",
                "emoticon": "🛀",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-resting"
            },
            {
                "description": "person taking bath",
                "emoticon": "🛀🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-resting"
            },
            {
                "description": "person taking bath",
                "emoticon": "🛀🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-resting"
            },
            {
                "description": "person taking bath",
                "emoticon": "🛀🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-resting"
            },
            {
                "description": "person taking bath",
                "emoticon": "🛀🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-resting"
            },
            {
                "description": "person taking bath",
                "emoticon": "🛀🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-resting"
            }
        ],
        "family": [
            {
                "description": "people holding hands",
                "emoticon": "🧑‍🤝‍🧑",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "people holding hands",
                "emoticon": "🧑🏻‍🤝‍🧑🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "people holding hands",
                "emoticon": "🧑🏻‍🤝‍🧑🏼",
                "toneType": [
                    "light skin tone",
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "people holding hands",
                "emoticon": "🧑🏻‍🤝‍🧑🏽",
                "toneType": [
                    "light skin tone",
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "people holding hands",
                "emoticon": "🧑🏻‍🤝‍🧑🏾",
                "toneType": [
                    "light skin tone",
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "people holding hands",
                "emoticon": "🧑🏻‍🤝‍🧑🏿",
                "toneType": [
                    "light skin tone",
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "people holding hands",
                "emoticon": "🧑🏼‍🤝‍🧑🏻",
                "toneType": [
                    "medium-light skin tone",
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "people holding hands",
                "emoticon": "🧑🏼‍🤝‍🧑🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "people holding hands",
                "emoticon": "🧑🏼‍🤝‍🧑🏽",
                "toneType": [
                    "medium-light skin tone",
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "people holding hands",
                "emoticon": "🧑🏼‍🤝‍🧑🏾",
                "toneType": [
                    "medium-light skin tone",
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "people holding hands",
                "emoticon": "🧑🏼‍🤝‍🧑🏿",
                "toneType": [
                    "medium-light skin tone",
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "people holding hands",
                "emoticon": "🧑🏽‍🤝‍🧑🏻",
                "toneType": [
                    "medium skin tone",
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "people holding hands",
                "emoticon": "🧑🏽‍🤝‍🧑🏼",
                "toneType": [
                    "medium skin tone",
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "people holding hands",
                "emoticon": "🧑🏽‍🤝‍🧑🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "people holding hands",
                "emoticon": "🧑🏽‍🤝‍🧑🏾",
                "toneType": [
                    "medium skin tone",
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "people holding hands",
                "emoticon": "🧑🏽‍🤝‍🧑🏿",
                "toneType": [
                    "medium skin tone",
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "people holding hands",
                "emoticon": "🧑🏾‍🤝‍🧑🏻",
                "toneType": [
                    "medium-dark skin tone",
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "people holding hands",
                "emoticon": "🧑🏾‍🤝‍🧑🏼",
                "toneType": [
                    "medium-dark skin tone",
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "people holding hands",
                "emoticon": "🧑🏾‍🤝‍🧑🏽",
                "toneType": [
                    "medium-dark skin tone",
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "people holding hands",
                "emoticon": "🧑🏾‍🤝‍🧑🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "people holding hands",
                "emoticon": "🧑🏾‍🤝‍🧑🏿",
                "toneType": [
                    "medium-dark skin tone",
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "people holding hands",
                "emoticon": "🧑🏿‍🤝‍🧑🏻",
                "toneType": [
                    "dark skin tone",
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "people holding hands",
                "emoticon": "🧑🏿‍🤝‍🧑🏼",
                "toneType": [
                    "dark skin tone",
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "people holding hands",
                "emoticon": "🧑🏿‍🤝‍🧑🏽",
                "toneType": [
                    "dark skin tone",
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "people holding hands",
                "emoticon": "🧑🏿‍🤝‍🧑🏾",
                "toneType": [
                    "dark skin tone",
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "people holding hands",
                "emoticon": "🧑🏿‍🤝‍🧑🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "kiss",
                "emoticon": "🧑🏻‍❤️‍💋‍🧑🏼",
                "toneType": [
                    "light skin tone",
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "kiss",
                "emoticon": "🧑🏻‍❤️‍💋‍🧑🏽",
                "toneType": [
                    "light skin tone",
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "kiss",
                "emoticon": "🧑🏻‍❤️‍💋‍🧑🏾",
                "toneType": [
                    "light skin tone",
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "kiss",
                "emoticon": "🧑🏻‍❤️‍💋‍🧑🏿",
                "toneType": [
                    "light skin tone",
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "kiss",
                "emoticon": "🧑🏼‍❤️‍💋‍🧑🏻",
                "toneType": [
                    "medium-light skin tone",
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "kiss",
                "emoticon": "🧑🏼‍❤️‍💋‍🧑🏽",
                "toneType": [
                    "medium-light skin tone",
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "kiss",
                "emoticon": "🧑🏼‍❤️‍💋‍🧑🏾",
                "toneType": [
                    "medium-light skin tone",
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "kiss",
                "emoticon": "🧑🏼‍❤️‍💋‍🧑🏿",
                "toneType": [
                    "medium-light skin tone",
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "kiss",
                "emoticon": "🧑🏽‍❤️‍💋‍🧑🏻",
                "toneType": [
                    "medium skin tone",
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "kiss",
                "emoticon": "🧑🏽‍❤️‍💋‍🧑🏼",
                "toneType": [
                    "medium skin tone",
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "kiss",
                "emoticon": "🧑🏽‍❤️‍💋‍🧑🏾",
                "toneType": [
                    "medium skin tone",
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "kiss",
                "emoticon": "🧑🏽‍❤️‍💋‍🧑🏿",
                "toneType": [
                    "medium skin tone",
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "kiss",
                "emoticon": "🧑🏾‍❤️‍💋‍🧑🏻",
                "toneType": [
                    "medium-dark skin tone",
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "kiss",
                "emoticon": "🧑🏾‍❤️‍💋‍🧑🏼",
                "toneType": [
                    "medium-dark skin tone",
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "kiss",
                "emoticon": "🧑🏾‍❤️‍💋‍🧑🏽",
                "toneType": [
                    "medium-dark skin tone",
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "kiss",
                "emoticon": "🧑🏾‍❤️‍💋‍🧑🏿",
                "toneType": [
                    "medium-dark skin tone",
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "kiss",
                "emoticon": "🧑🏿‍❤️‍💋‍🧑🏻",
                "toneType": [
                    "dark skin tone",
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "kiss",
                "emoticon": "🧑🏿‍❤️‍💋‍🧑🏼",
                "toneType": [
                    "dark skin tone",
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "kiss",
                "emoticon": "🧑🏿‍❤️‍💋‍🧑🏽",
                "toneType": [
                    "dark skin tone",
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "kiss",
                "emoticon": "🧑🏿‍❤️‍💋‍🧑🏾",
                "toneType": [
                    "dark skin tone",
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "couple with heart",
                "emoticon": "🧑🏻‍❤️‍🧑🏼",
                "toneType": [
                    "light skin tone",
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "couple with heart",
                "emoticon": "🧑🏻‍❤️‍🧑🏽",
                "toneType": [
                    "light skin tone",
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "couple with heart",
                "emoticon": "🧑🏻‍❤️‍🧑🏾",
                "toneType": [
                    "light skin tone",
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "couple with heart",
                "emoticon": "🧑🏻‍❤️‍🧑🏿",
                "toneType": [
                    "light skin tone",
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "couple with heart",
                "emoticon": "🧑🏼‍❤️‍🧑🏻",
                "toneType": [
                    "medium-light skin tone",
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "couple with heart",
                "emoticon": "🧑🏼‍❤️‍🧑🏽",
                "toneType": [
                    "medium-light skin tone",
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "couple with heart",
                "emoticon": "🧑🏼‍❤️‍🧑🏾",
                "toneType": [
                    "medium-light skin tone",
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "couple with heart",
                "emoticon": "🧑🏼‍❤️‍🧑🏿",
                "toneType": [
                    "medium-light skin tone",
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "couple with heart",
                "emoticon": "🧑🏽‍❤️‍🧑🏻",
                "toneType": [
                    "medium skin tone",
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "couple with heart",
                "emoticon": "🧑🏽‍❤️‍🧑🏼",
                "toneType": [
                    "medium skin tone",
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "couple with heart",
                "emoticon": "🧑🏽‍❤️‍🧑🏾",
                "toneType": [
                    "medium skin tone",
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "couple with heart",
                "emoticon": "🧑🏽‍❤️‍🧑🏿",
                "toneType": [
                    "medium skin tone",
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "couple with heart",
                "emoticon": "🧑🏾‍❤️‍🧑🏻",
                "toneType": [
                    "medium-dark skin tone",
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "couple with heart",
                "emoticon": "🧑🏾‍❤️‍🧑🏼",
                "toneType": [
                    "medium-dark skin tone",
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "couple with heart",
                "emoticon": "🧑🏾‍❤️‍🧑🏽",
                "toneType": [
                    "medium-dark skin tone",
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "couple with heart",
                "emoticon": "🧑🏾‍❤️‍🧑🏿",
                "toneType": [
                    "medium-dark skin tone",
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "couple with heart",
                "emoticon": "🧑🏿‍❤️‍🧑🏻",
                "toneType": [
                    "dark skin tone",
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "couple with heart",
                "emoticon": "🧑🏿‍❤️‍🧑🏼",
                "toneType": [
                    "dark skin tone",
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "couple with heart",
                "emoticon": "🧑🏿‍❤️‍🧑🏽",
                "toneType": [
                    "dark skin tone",
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "couple with heart",
                "emoticon": "🧑🏿‍❤️‍🧑🏾",
                "toneType": [
                    "dark skin tone",
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "couple with heart",
                "emoticon": "💑",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "couple with heart",
                "emoticon": "💑🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "couple with heart",
                "emoticon": "💑🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "couple with heart",
                "emoticon": "💑🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "couple with heart",
                "emoticon": "💑🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "couple with heart",
                "emoticon": "💑🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "kiss",
                "emoticon": "💏",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "kiss",
                "emoticon": "💏🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "kiss",
                "emoticon": "💏🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "kiss",
                "emoticon": "💏🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "kiss",
                "emoticon": "💏🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "kiss",
                "emoticon": "💏🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "women holding hands",
                "emoticon": "👭",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "women holding hands",
                "emoticon": "👭🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "women holding hands",
                "emoticon": "👭🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "women holding hands",
                "emoticon": "👭🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "women holding hands",
                "emoticon": "👭🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "women holding hands",
                "emoticon": "👭🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "men holding hands",
                "emoticon": "👬",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "men holding hands",
                "emoticon": "👬🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "men holding hands",
                "emoticon": "👬🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "men holding hands",
                "emoticon": "👬🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "men holding hands",
                "emoticon": "👬🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "men holding hands",
                "emoticon": "👬🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "woman and man holding hands",
                "emoticon": "👫",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "woman and man holding hands",
                "emoticon": "👫🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "woman and man holding hands",
                "emoticon": "👫🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "woman and man holding hands",
                "emoticon": "👫🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "woman and man holding hands",
                "emoticon": "👫🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "woman and man holding hands",
                "emoticon": "👫🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "women holding hands",
                "emoticon": "👩🏻‍🤝‍👩🏼",
                "toneType": [
                    "light skin tone",
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "women holding hands",
                "emoticon": "👩🏻‍🤝‍👩🏽",
                "toneType": [
                    "light skin tone",
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "women holding hands",
                "emoticon": "👩🏻‍🤝‍👩🏾",
                "toneType": [
                    "light skin tone",
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "women holding hands",
                "emoticon": "👩🏻‍🤝‍👩🏿",
                "toneType": [
                    "light skin tone",
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "women holding hands",
                "emoticon": "👩🏼‍🤝‍👩🏻",
                "toneType": [
                    "medium-light skin tone",
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "women holding hands",
                "emoticon": "👩🏼‍🤝‍👩🏽",
                "toneType": [
                    "medium-light skin tone",
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "women holding hands",
                "emoticon": "👩🏼‍🤝‍👩🏾",
                "toneType": [
                    "medium-light skin tone",
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "women holding hands",
                "emoticon": "👩🏼‍🤝‍👩🏿",
                "toneType": [
                    "medium-light skin tone",
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "women holding hands",
                "emoticon": "👩🏽‍🤝‍👩🏻",
                "toneType": [
                    "medium skin tone",
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "women holding hands",
                "emoticon": "👩🏽‍🤝‍👩🏼",
                "toneType": [
                    "medium skin tone",
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "women holding hands",
                "emoticon": "👩🏽‍🤝‍👩🏾",
                "toneType": [
                    "medium skin tone",
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "women holding hands",
                "emoticon": "👩🏽‍🤝‍👩🏿",
                "toneType": [
                    "medium skin tone",
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "women holding hands",
                "emoticon": "👩🏾‍🤝‍👩🏻",
                "toneType": [
                    "medium-dark skin tone",
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "women holding hands",
                "emoticon": "👩🏾‍🤝‍👩🏼",
                "toneType": [
                    "medium-dark skin tone",
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "women holding hands",
                "emoticon": "👩🏾‍🤝‍👩🏽",
                "toneType": [
                    "medium-dark skin tone",
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "women holding hands",
                "emoticon": "👩🏾‍🤝‍👩🏿",
                "toneType": [
                    "medium-dark skin tone",
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "women holding hands",
                "emoticon": "👩🏿‍🤝‍👩🏻",
                "toneType": [
                    "dark skin tone",
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "women holding hands",
                "emoticon": "👩🏿‍🤝‍👩🏼",
                "toneType": [
                    "dark skin tone",
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "women holding hands",
                "emoticon": "👩🏿‍🤝‍👩🏽",
                "toneType": [
                    "dark skin tone",
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "women holding hands",
                "emoticon": "👩🏿‍🤝‍👩🏾",
                "toneType": [
                    "dark skin tone",
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "woman and man holding hands",
                "emoticon": "👩🏻‍🤝‍👨🏼",
                "toneType": [
                    "light skin tone",
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "woman and man holding hands",
                "emoticon": "👩🏻‍🤝‍👨🏽",
                "toneType": [
                    "light skin tone",
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "woman and man holding hands",
                "emoticon": "👩🏻‍🤝‍👨🏾",
                "toneType": [
                    "light skin tone",
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "woman and man holding hands",
                "emoticon": "👩🏻‍🤝‍👨🏿",
                "toneType": [
                    "light skin tone",
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "woman and man holding hands",
                "emoticon": "👩🏼‍🤝‍👨🏻",
                "toneType": [
                    "medium-light skin tone",
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "woman and man holding hands",
                "emoticon": "👩🏼‍🤝‍👨🏽",
                "toneType": [
                    "medium-light skin tone",
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "woman and man holding hands",
                "emoticon": "👩🏼‍🤝‍👨🏾",
                "toneType": [
                    "medium-light skin tone",
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "woman and man holding hands",
                "emoticon": "👩🏼‍🤝‍👨🏿",
                "toneType": [
                    "medium-light skin tone",
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "woman and man holding hands",
                "emoticon": "👩🏽‍🤝‍👨🏻",
                "toneType": [
                    "medium skin tone",
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "woman and man holding hands",
                "emoticon": "👩🏽‍🤝‍👨🏼",
                "toneType": [
                    "medium skin tone",
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "woman and man holding hands",
                "emoticon": "👩🏽‍🤝‍👨🏾",
                "toneType": [
                    "medium skin tone",
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "woman and man holding hands",
                "emoticon": "👩🏽‍🤝‍👨🏿",
                "toneType": [
                    "medium skin tone",
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "woman and man holding hands",
                "emoticon": "👩🏾‍🤝‍👨🏻",
                "toneType": [
                    "medium-dark skin tone",
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "woman and man holding hands",
                "emoticon": "👩🏾‍🤝‍👨🏼",
                "toneType": [
                    "medium-dark skin tone",
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "woman and man holding hands",
                "emoticon": "👩🏾‍🤝‍👨🏽",
                "toneType": [
                    "medium-dark skin tone",
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "woman and man holding hands",
                "emoticon": "👩🏾‍🤝‍👨🏿",
                "toneType": [
                    "medium-dark skin tone",
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "woman and man holding hands",
                "emoticon": "👩🏿‍🤝‍👨🏻",
                "toneType": [
                    "dark skin tone",
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "woman and man holding hands",
                "emoticon": "👩🏿‍🤝‍👨🏼",
                "toneType": [
                    "dark skin tone",
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "woman and man holding hands",
                "emoticon": "👩🏿‍🤝‍👨🏽",
                "toneType": [
                    "dark skin tone",
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "woman and man holding hands",
                "emoticon": "👩🏿‍🤝‍👨🏾",
                "toneType": [
                    "dark skin tone",
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "kiss",
                "emoticon": "👩‍❤️‍💋‍👨",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "kiss",
                "emoticon": "👩🏻‍❤️‍💋‍👨🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "kiss",
                "emoticon": "👩🏻‍❤️‍💋‍👨🏼",
                "toneType": [
                    "light skin tone",
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "kiss",
                "emoticon": "👩🏻‍❤️‍💋‍👨🏽",
                "toneType": [
                    "light skin tone",
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "kiss",
                "emoticon": "👩🏻‍❤️‍💋‍👨🏾",
                "toneType": [
                    "light skin tone",
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "kiss",
                "emoticon": "👩🏻‍❤️‍💋‍👨🏿",
                "toneType": [
                    "light skin tone",
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "kiss",
                "emoticon": "👩🏼‍❤️‍💋‍👨🏻",
                "toneType": [
                    "medium-light skin tone",
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "kiss",
                "emoticon": "👩🏼‍❤️‍💋‍👨🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "kiss",
                "emoticon": "👩🏼‍❤️‍💋‍👨🏽",
                "toneType": [
                    "medium-light skin tone",
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "kiss",
                "emoticon": "👩🏼‍❤️‍💋‍👨🏾",
                "toneType": [
                    "medium-light skin tone",
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "kiss",
                "emoticon": "👩🏼‍❤️‍💋‍👨🏿",
                "toneType": [
                    "medium-light skin tone",
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "kiss",
                "emoticon": "👩🏽‍❤️‍💋‍👨🏻",
                "toneType": [
                    "medium skin tone",
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "kiss",
                "emoticon": "👩🏽‍❤️‍💋‍👨🏼",
                "toneType": [
                    "medium skin tone",
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "kiss",
                "emoticon": "👩🏽‍❤️‍💋‍👨🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "kiss",
                "emoticon": "👩🏽‍❤️‍💋‍👨🏾",
                "toneType": [
                    "medium skin tone",
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "kiss",
                "emoticon": "👩🏽‍❤️‍💋‍👨🏿",
                "toneType": [
                    "medium skin tone",
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "kiss",
                "emoticon": "👩🏾‍❤️‍💋‍👨🏻",
                "toneType": [
                    "medium-dark skin tone",
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "kiss",
                "emoticon": "👩🏾‍❤️‍💋‍👨🏼",
                "toneType": [
                    "medium-dark skin tone",
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "kiss",
                "emoticon": "👩🏾‍❤️‍💋‍👨🏽",
                "toneType": [
                    "medium-dark skin tone",
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "kiss",
                "emoticon": "👩🏾‍❤️‍💋‍👨🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "kiss",
                "emoticon": "👩🏾‍❤️‍💋‍👨🏿",
                "toneType": [
                    "medium-dark skin tone",
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "kiss",
                "emoticon": "👩🏿‍❤️‍💋‍👨🏻",
                "toneType": [
                    "dark skin tone",
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "kiss",
                "emoticon": "👩🏿‍❤️‍💋‍👨🏼",
                "toneType": [
                    "dark skin tone",
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "kiss",
                "emoticon": "👩🏿‍❤️‍💋‍👨🏽",
                "toneType": [
                    "dark skin tone",
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "kiss",
                "emoticon": "👩🏿‍❤️‍💋‍👨🏾",
                "toneType": [
                    "dark skin tone",
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "kiss",
                "emoticon": "👩🏿‍❤️‍💋‍👨🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "kiss",
                "emoticon": "👩‍❤️‍💋‍👩",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "kiss",
                "emoticon": "👩🏻‍❤️‍💋‍👩🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "kiss",
                "emoticon": "👩🏻‍❤️‍💋‍👩🏼",
                "toneType": [
                    "light skin tone",
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "kiss",
                "emoticon": "👩🏻‍❤️‍💋‍👩🏽",
                "toneType": [
                    "light skin tone",
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "kiss",
                "emoticon": "👩🏻‍❤️‍💋‍👩🏾",
                "toneType": [
                    "light skin tone",
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "kiss",
                "emoticon": "👩🏻‍❤️‍💋‍👩🏿",
                "toneType": [
                    "light skin tone",
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "kiss",
                "emoticon": "👩🏼‍❤️‍💋‍👩🏻",
                "toneType": [
                    "medium-light skin tone",
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "kiss",
                "emoticon": "👩🏼‍❤️‍💋‍👩🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "kiss",
                "emoticon": "👩🏼‍❤️‍💋‍👩🏽",
                "toneType": [
                    "medium-light skin tone",
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "kiss",
                "emoticon": "👩🏼‍❤️‍💋‍👩🏾",
                "toneType": [
                    "medium-light skin tone",
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "kiss",
                "emoticon": "👩🏼‍❤️‍💋‍👩🏿",
                "toneType": [
                    "medium-light skin tone",
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "kiss",
                "emoticon": "👩🏽‍❤️‍💋‍👩🏻",
                "toneType": [
                    "medium skin tone",
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "kiss",
                "emoticon": "👩🏽‍❤️‍💋‍👩🏼",
                "toneType": [
                    "medium skin tone",
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "kiss",
                "emoticon": "👩🏽‍❤️‍💋‍👩🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "kiss",
                "emoticon": "👩🏽‍❤️‍💋‍👩🏾",
                "toneType": [
                    "medium skin tone",
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "kiss",
                "emoticon": "👩🏽‍❤️‍💋‍👩🏿",
                "toneType": [
                    "medium skin tone",
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "kiss",
                "emoticon": "👩🏾‍❤️‍💋‍👩🏻",
                "toneType": [
                    "medium-dark skin tone",
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "kiss",
                "emoticon": "👩🏾‍❤️‍💋‍👩🏼",
                "toneType": [
                    "medium-dark skin tone",
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "kiss",
                "emoticon": "👩🏾‍❤️‍💋‍👩🏽",
                "toneType": [
                    "medium-dark skin tone",
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "kiss",
                "emoticon": "👩🏾‍❤️‍💋‍👩🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "kiss",
                "emoticon": "👩🏾‍❤️‍💋‍👩🏿",
                "toneType": [
                    "medium-dark skin tone",
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "kiss",
                "emoticon": "👩🏿‍❤️‍💋‍👩🏻",
                "toneType": [
                    "dark skin tone",
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "kiss",
                "emoticon": "👩🏿‍❤️‍💋‍👩🏼",
                "toneType": [
                    "dark skin tone",
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "kiss",
                "emoticon": "👩🏿‍❤️‍💋‍👩🏽",
                "toneType": [
                    "dark skin tone",
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "kiss",
                "emoticon": "👩🏿‍❤️‍💋‍👩🏾",
                "toneType": [
                    "dark skin tone",
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "kiss",
                "emoticon": "👩🏿‍❤️‍💋‍👩🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "couple with heart",
                "emoticon": "👩‍❤️‍👨",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "couple with heart",
                "emoticon": "👩🏻‍❤️‍👨🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "couple with heart",
                "emoticon": "👩🏻‍❤️‍👨🏼",
                "toneType": [
                    "light skin tone",
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "couple with heart",
                "emoticon": "👩🏻‍❤️‍👨🏽",
                "toneType": [
                    "light skin tone",
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "couple with heart",
                "emoticon": "👩🏻‍❤️‍👨🏾",
                "toneType": [
                    "light skin tone",
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "couple with heart",
                "emoticon": "👩🏻‍❤️‍👨🏿",
                "toneType": [
                    "light skin tone",
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "couple with heart",
                "emoticon": "👩🏼‍❤️‍👨🏻",
                "toneType": [
                    "medium-light skin tone",
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "couple with heart",
                "emoticon": "👩🏼‍❤️‍👨🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "couple with heart",
                "emoticon": "👩🏼‍❤️‍👨🏽",
                "toneType": [
                    "medium-light skin tone",
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "couple with heart",
                "emoticon": "👩🏼‍❤️‍👨🏾",
                "toneType": [
                    "medium-light skin tone",
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "couple with heart",
                "emoticon": "👩🏼‍❤️‍👨🏿",
                "toneType": [
                    "medium-light skin tone",
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "couple with heart",
                "emoticon": "👩🏽‍❤️‍👨🏻",
                "toneType": [
                    "medium skin tone",
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "couple with heart",
                "emoticon": "👩🏽‍❤️‍👨🏼",
                "toneType": [
                    "medium skin tone",
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "couple with heart",
                "emoticon": "👩🏽‍❤️‍👨🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "couple with heart",
                "emoticon": "👩🏽‍❤️‍👨🏾",
                "toneType": [
                    "medium skin tone",
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "couple with heart",
                "emoticon": "👩🏽‍❤️‍👨🏿",
                "toneType": [
                    "medium skin tone",
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "couple with heart",
                "emoticon": "👩🏾‍❤️‍👨🏻",
                "toneType": [
                    "medium-dark skin tone",
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "couple with heart",
                "emoticon": "👩🏾‍❤️‍👨🏼",
                "toneType": [
                    "medium-dark skin tone",
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "couple with heart",
                "emoticon": "👩🏾‍❤️‍👨🏽",
                "toneType": [
                    "medium-dark skin tone",
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "couple with heart",
                "emoticon": "👩🏾‍❤️‍👨🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "couple with heart",
                "emoticon": "👩🏾‍❤️‍👨🏿",
                "toneType": [
                    "medium-dark skin tone",
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "couple with heart",
                "emoticon": "👩🏿‍❤️‍👨🏻",
                "toneType": [
                    "dark skin tone",
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "couple with heart",
                "emoticon": "👩🏿‍❤️‍👨🏼",
                "toneType": [
                    "dark skin tone",
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "couple with heart",
                "emoticon": "👩🏿‍❤️‍👨🏽",
                "toneType": [
                    "dark skin tone",
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "couple with heart",
                "emoticon": "👩🏿‍❤️‍👨🏾",
                "toneType": [
                    "dark skin tone",
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "couple with heart",
                "emoticon": "👩🏿‍❤️‍👨🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "couple with heart",
                "emoticon": "👩‍❤️‍👩",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "couple with heart",
                "emoticon": "👩🏻‍❤️‍👩🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "couple with heart",
                "emoticon": "👩🏻‍❤️‍👩🏼",
                "toneType": [
                    "light skin tone",
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "couple with heart",
                "emoticon": "👩🏻‍❤️‍👩🏽",
                "toneType": [
                    "light skin tone",
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "couple with heart",
                "emoticon": "👩🏻‍❤️‍👩🏾",
                "toneType": [
                    "light skin tone",
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "couple with heart",
                "emoticon": "👩🏻‍❤️‍👩🏿",
                "toneType": [
                    "light skin tone",
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "couple with heart",
                "emoticon": "👩🏼‍❤️‍👩🏻",
                "toneType": [
                    "medium-light skin tone",
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "couple with heart",
                "emoticon": "👩🏼‍❤️‍👩🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "couple with heart",
                "emoticon": "👩🏼‍❤️‍👩🏽",
                "toneType": [
                    "medium-light skin tone",
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "couple with heart",
                "emoticon": "👩🏼‍❤️‍👩🏾",
                "toneType": [
                    "medium-light skin tone",
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "couple with heart",
                "emoticon": "👩🏼‍❤️‍👩🏿",
                "toneType": [
                    "medium-light skin tone",
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "couple with heart",
                "emoticon": "👩🏽‍❤️‍👩🏻",
                "toneType": [
                    "medium skin tone",
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "couple with heart",
                "emoticon": "👩🏽‍❤️‍👩🏼",
                "toneType": [
                    "medium skin tone",
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "couple with heart",
                "emoticon": "👩🏽‍❤️‍👩🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "couple with heart",
                "emoticon": "👩🏽‍❤️‍👩🏾",
                "toneType": [
                    "medium skin tone",
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "couple with heart",
                "emoticon": "👩🏽‍❤️‍👩🏿",
                "toneType": [
                    "medium skin tone",
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "couple with heart",
                "emoticon": "👩🏾‍❤️‍👩🏻",
                "toneType": [
                    "medium-dark skin tone",
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "couple with heart",
                "emoticon": "👩🏾‍❤️‍👩🏼",
                "toneType": [
                    "medium-dark skin tone",
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "couple with heart",
                "emoticon": "👩🏾‍❤️‍👩🏽",
                "toneType": [
                    "medium-dark skin tone",
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "couple with heart",
                "emoticon": "👩🏾‍❤️‍👩🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "couple with heart",
                "emoticon": "👩🏾‍❤️‍👩🏿",
                "toneType": [
                    "medium-dark skin tone",
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "couple with heart",
                "emoticon": "👩🏿‍❤️‍👩🏻",
                "toneType": [
                    "dark skin tone",
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "couple with heart",
                "emoticon": "👩🏿‍❤️‍👩🏼",
                "toneType": [
                    "dark skin tone",
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "couple with heart",
                "emoticon": "👩🏿‍❤️‍👩🏽",
                "toneType": [
                    "dark skin tone",
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "couple with heart",
                "emoticon": "👩🏿‍❤️‍👩🏾",
                "toneType": [
                    "dark skin tone",
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "couple with heart",
                "emoticon": "👩🏿‍❤️‍👩🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "family",
                "emoticon": "👩‍👩‍👦",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "family",
                "emoticon": "👩‍👩‍👧",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "family",
                "emoticon": "👩‍👩‍👧‍👦",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "family",
                "emoticon": "👩‍👩‍👦‍👦",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "family",
                "emoticon": "👩‍👩‍👧‍👧",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "family",
                "emoticon": "👩‍👦",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "family",
                "emoticon": "👩‍👦‍👦",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "family",
                "emoticon": "👩‍👧",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "family",
                "emoticon": "👩‍👧‍👦",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "family",
                "emoticon": "👩‍👧‍👧",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "men holding hands",
                "emoticon": "👨🏻‍🤝‍👨🏼",
                "toneType": [
                    "light skin tone",
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "men holding hands",
                "emoticon": "👨🏻‍🤝‍👨🏽",
                "toneType": [
                    "light skin tone",
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "men holding hands",
                "emoticon": "👨🏻‍🤝‍👨🏾",
                "toneType": [
                    "light skin tone",
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "men holding hands",
                "emoticon": "👨🏻‍🤝‍👨🏿",
                "toneType": [
                    "light skin tone",
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "men holding hands",
                "emoticon": "👨🏼‍🤝‍👨🏻",
                "toneType": [
                    "medium-light skin tone",
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "men holding hands",
                "emoticon": "👨🏼‍🤝‍👨🏽",
                "toneType": [
                    "medium-light skin tone",
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "men holding hands",
                "emoticon": "👨🏼‍🤝‍👨🏾",
                "toneType": [
                    "medium-light skin tone",
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "men holding hands",
                "emoticon": "👨🏼‍🤝‍👨🏿",
                "toneType": [
                    "medium-light skin tone",
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "men holding hands",
                "emoticon": "👨🏽‍🤝‍👨🏻",
                "toneType": [
                    "medium skin tone",
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "men holding hands",
                "emoticon": "👨🏽‍🤝‍👨🏼",
                "toneType": [
                    "medium skin tone",
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "men holding hands",
                "emoticon": "👨🏽‍🤝‍👨🏾",
                "toneType": [
                    "medium skin tone",
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "men holding hands",
                "emoticon": "👨🏽‍🤝‍👨🏿",
                "toneType": [
                    "medium skin tone",
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "men holding hands",
                "emoticon": "👨🏾‍🤝‍👨🏻",
                "toneType": [
                    "medium-dark skin tone",
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "men holding hands",
                "emoticon": "👨🏾‍🤝‍👨🏼",
                "toneType": [
                    "medium-dark skin tone",
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "men holding hands",
                "emoticon": "👨🏾‍🤝‍👨🏽",
                "toneType": [
                    "medium-dark skin tone",
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "men holding hands",
                "emoticon": "👨🏾‍🤝‍👨🏿",
                "toneType": [
                    "medium-dark skin tone",
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "men holding hands",
                "emoticon": "👨🏿‍🤝‍👨🏻",
                "toneType": [
                    "dark skin tone",
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "men holding hands",
                "emoticon": "👨🏿‍🤝‍👨🏼",
                "toneType": [
                    "dark skin tone",
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "men holding hands",
                "emoticon": "👨🏿‍🤝‍👨🏽",
                "toneType": [
                    "dark skin tone",
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "men holding hands",
                "emoticon": "👨🏿‍🤝‍👨🏾",
                "toneType": [
                    "dark skin tone",
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "kiss",
                "emoticon": "👨‍❤️‍💋‍👨",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "kiss",
                "emoticon": "👨🏻‍❤️‍💋‍👨🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "kiss",
                "emoticon": "👨🏻‍❤️‍💋‍👨🏼",
                "toneType": [
                    "light skin tone",
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "kiss",
                "emoticon": "👨🏻‍❤️‍💋‍👨🏽",
                "toneType": [
                    "light skin tone",
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "kiss",
                "emoticon": "👨🏻‍❤️‍💋‍👨🏾",
                "toneType": [
                    "light skin tone",
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "kiss",
                "emoticon": "👨🏻‍❤️‍💋‍👨🏿",
                "toneType": [
                    "light skin tone",
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "kiss",
                "emoticon": "👨🏼‍❤️‍💋‍👨🏻",
                "toneType": [
                    "medium-light skin tone",
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "kiss",
                "emoticon": "👨🏼‍❤️‍💋‍👨🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "kiss",
                "emoticon": "👨🏼‍❤️‍💋‍👨🏽",
                "toneType": [
                    "medium-light skin tone",
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "kiss",
                "emoticon": "👨🏼‍❤️‍💋‍👨🏾",
                "toneType": [
                    "medium-light skin tone",
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "kiss",
                "emoticon": "👨🏼‍❤️‍💋‍👨🏿",
                "toneType": [
                    "medium-light skin tone",
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "kiss",
                "emoticon": "👨🏽‍❤️‍💋‍👨🏻",
                "toneType": [
                    "medium skin tone",
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "kiss",
                "emoticon": "👨🏽‍❤️‍💋‍👨🏼",
                "toneType": [
                    "medium skin tone",
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "kiss",
                "emoticon": "👨🏽‍❤️‍💋‍👨🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "kiss",
                "emoticon": "👨🏽‍❤️‍💋‍👨🏾",
                "toneType": [
                    "medium skin tone",
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "kiss",
                "emoticon": "👨🏽‍❤️‍💋‍👨🏿",
                "toneType": [
                    "medium skin tone",
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "kiss",
                "emoticon": "👨🏾‍❤️‍💋‍👨🏻",
                "toneType": [
                    "medium-dark skin tone",
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "kiss",
                "emoticon": "👨🏾‍❤️‍💋‍👨🏼",
                "toneType": [
                    "medium-dark skin tone",
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "kiss",
                "emoticon": "👨🏾‍❤️‍💋‍👨🏽",
                "toneType": [
                    "medium-dark skin tone",
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "kiss",
                "emoticon": "👨🏾‍❤️‍💋‍👨🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "kiss",
                "emoticon": "👨🏾‍❤️‍💋‍👨🏿",
                "toneType": [
                    "medium-dark skin tone",
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "kiss",
                "emoticon": "👨🏿‍❤️‍💋‍👨🏻",
                "toneType": [
                    "dark skin tone",
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "kiss",
                "emoticon": "👨🏿‍❤️‍💋‍👨🏼",
                "toneType": [
                    "dark skin tone",
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "kiss",
                "emoticon": "👨🏿‍❤️‍💋‍👨🏽",
                "toneType": [
                    "dark skin tone",
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "kiss",
                "emoticon": "👨🏿‍❤️‍💋‍👨🏾",
                "toneType": [
                    "dark skin tone",
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "kiss",
                "emoticon": "👨🏿‍❤️‍💋‍👨🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "couple with heart",
                "emoticon": "👨‍❤️‍👨",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "couple with heart",
                "emoticon": "👨🏻‍❤️‍👨🏻",
                "toneType": [
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "couple with heart",
                "emoticon": "👨🏻‍❤️‍👨🏼",
                "toneType": [
                    "light skin tone",
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "couple with heart",
                "emoticon": "👨🏻‍❤️‍👨🏽",
                "toneType": [
                    "light skin tone",
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "couple with heart",
                "emoticon": "👨🏻‍❤️‍👨🏾",
                "toneType": [
                    "light skin tone",
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "couple with heart",
                "emoticon": "👨🏻‍❤️‍👨🏿",
                "toneType": [
                    "light skin tone",
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "couple with heart",
                "emoticon": "👨🏼‍❤️‍👨🏻",
                "toneType": [
                    "medium-light skin tone",
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "couple with heart",
                "emoticon": "👨🏼‍❤️‍👨🏼",
                "toneType": [
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "couple with heart",
                "emoticon": "👨🏼‍❤️‍👨🏽",
                "toneType": [
                    "medium-light skin tone",
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "couple with heart",
                "emoticon": "👨🏼‍❤️‍👨🏾",
                "toneType": [
                    "medium-light skin tone",
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "couple with heart",
                "emoticon": "👨🏼‍❤️‍👨🏿",
                "toneType": [
                    "medium-light skin tone",
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "couple with heart",
                "emoticon": "👨🏽‍❤️‍👨🏻",
                "toneType": [
                    "medium skin tone",
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "couple with heart",
                "emoticon": "👨🏽‍❤️‍👨🏼",
                "toneType": [
                    "medium skin tone",
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "couple with heart",
                "emoticon": "👨🏽‍❤️‍👨🏽",
                "toneType": [
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "couple with heart",
                "emoticon": "👨🏽‍❤️‍👨🏾",
                "toneType": [
                    "medium skin tone",
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "couple with heart",
                "emoticon": "👨🏽‍❤️‍👨🏿",
                "toneType": [
                    "medium skin tone",
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "couple with heart",
                "emoticon": "👨🏾‍❤️‍👨🏻",
                "toneType": [
                    "medium-dark skin tone",
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "couple with heart",
                "emoticon": "👨🏾‍❤️‍👨🏼",
                "toneType": [
                    "medium-dark skin tone",
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "couple with heart",
                "emoticon": "👨🏾‍❤️‍👨🏽",
                "toneType": [
                    "medium-dark skin tone",
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "couple with heart",
                "emoticon": "👨🏾‍❤️‍👨🏾",
                "toneType": [
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "couple with heart",
                "emoticon": "👨🏾‍❤️‍👨🏿",
                "toneType": [
                    "medium-dark skin tone",
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "couple with heart",
                "emoticon": "👨🏿‍❤️‍👨🏻",
                "toneType": [
                    "dark skin tone",
                    "light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "couple with heart",
                "emoticon": "👨🏿‍❤️‍👨🏼",
                "toneType": [
                    "dark skin tone",
                    "medium-light skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "couple with heart",
                "emoticon": "👨🏿‍❤️‍👨🏽",
                "toneType": [
                    "dark skin tone",
                    "medium skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "couple with heart",
                "emoticon": "👨🏿‍❤️‍👨🏾",
                "toneType": [
                    "dark skin tone",
                    "medium-dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "couple with heart",
                "emoticon": "👨🏿‍❤️‍👨🏿",
                "toneType": [
                    "dark skin tone"
                ],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "family",
                "emoticon": "👨‍👩‍👦",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "family",
                "emoticon": "👨‍👩‍👧",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "family",
                "emoticon": "👨‍👩‍👧‍👦",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "family",
                "emoticon": "👨‍👩‍👦‍👦",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "family",
                "emoticon": "👨‍👩‍👧‍👧",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "family",
                "emoticon": "👨‍👨‍👦",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "family",
                "emoticon": "👨‍👨‍👧",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "family",
                "emoticon": "👨‍👨‍👧‍👦",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "family",
                "emoticon": "👨‍👨‍👦‍👦",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "family",
                "emoticon": "👨‍👨‍👧‍👧",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "family",
                "emoticon": "👨‍👦",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "family",
                "emoticon": "👨‍👦‍👦",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "family",
                "emoticon": "👨‍👧",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "family",
                "emoticon": "👨‍👧‍👦",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            },
            {
                "description": "family",
                "emoticon": "👨‍👧‍👧",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "family"
            }
        ],
        "person-symbol": [
            {
                "description": "family",
                "emoticon": "🧑‍🧑‍🧒",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-symbol"
            },
            {
                "description": "family",
                "emoticon": "🧑‍🧑‍🧒‍🧒",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-symbol"
            },
            {
                "description": "family",
                "emoticon": "🧑‍🧒",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-symbol"
            },
            {
                "description": "family",
                "emoticon": "🧑‍🧒‍🧒",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-symbol"
            },
            {
                "description": "speaking head",
                "emoticon": "🗣️",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-symbol"
            },
            {
                "description": "family",
                "emoticon": "👪",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-symbol"
            },
            {
                "description": "busts in silhouette",
                "emoticon": "👥",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-symbol"
            },
            {
                "description": "bust in silhouette",
                "emoticon": "👤",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-symbol"
            },
            {
                "description": "footprints",
                "emoticon": "👣",
                "toneType": [],
                "groupTitle": "People & Body",
                "subgroupTitle": "person-symbol"
            }
        ]
    },
    "Animals & Nature": {
        "animal-mammal": [
            {
                "description": "guide dog",
                "emoticon": "🦮",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-mammal"
            },
            {
                "description": "skunk",
                "emoticon": "🦨",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-mammal"
            },
            {
                "description": "orangutan",
                "emoticon": "🦧",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-mammal"
            },
            {
                "description": "otter",
                "emoticon": "🦦",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-mammal"
            },
            {
                "description": "sloth",
                "emoticon": "🦥",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-mammal"
            },
            {
                "description": "badger",
                "emoticon": "🦡",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-mammal"
            },
            {
                "description": "raccoon",
                "emoticon": "🦝",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-mammal"
            },
            {
                "description": "hippopotamus",
                "emoticon": "🦛",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-mammal"
            },
            {
                "description": "llama",
                "emoticon": "🦙",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-mammal"
            },
            {
                "description": "kangaroo",
                "emoticon": "🦘",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-mammal"
            },
            {
                "description": "hedgehog",
                "emoticon": "🦔",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-mammal"
            },
            {
                "description": "zebra",
                "emoticon": "🦓",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-mammal"
            },
            {
                "description": "giraffe",
                "emoticon": "🦒",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-mammal"
            },
            {
                "description": "rhinoceros",
                "emoticon": "🦏",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-mammal"
            },
            {
                "description": "gorilla",
                "emoticon": "🦍",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-mammal"
            },
            {
                "description": "deer",
                "emoticon": "🦌",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-mammal"
            },
            {
                "description": "fox",
                "emoticon": "🦊",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-mammal"
            },
            {
                "description": "bat",
                "emoticon": "🦇",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-mammal"
            },
            {
                "description": "unicorn",
                "emoticon": "🦄",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-mammal"
            },
            {
                "description": "lion",
                "emoticon": "🦁",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-mammal"
            },
            {
                "description": "chipmunk",
                "emoticon": "🐿️",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-mammal"
            },
            {
                "description": "paw prints",
                "emoticon": "🐾",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-mammal"
            },
            {
                "description": "pig nose",
                "emoticon": "🐽",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-mammal"
            },
            {
                "description": "panda",
                "emoticon": "🐼",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-mammal"
            },
            {
                "description": "bear",
                "emoticon": "🐻",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-mammal"
            },
            {
                "description": "polar bear",
                "emoticon": "🐻‍❄️",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-mammal"
            },
            {
                "description": "wolf",
                "emoticon": "🐺",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-mammal"
            },
            {
                "description": "hamster",
                "emoticon": "🐹",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-mammal"
            },
            {
                "description": "pig face",
                "emoticon": "🐷",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-mammal"
            },
            {
                "description": "dog face",
                "emoticon": "🐶",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-mammal"
            },
            {
                "description": "monkey face",
                "emoticon": "🐵",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-mammal"
            },
            {
                "description": "horse face",
                "emoticon": "🐴",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-mammal"
            },
            {
                "description": "cat face",
                "emoticon": "🐱",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-mammal"
            },
            {
                "description": "rabbit face",
                "emoticon": "🐰",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-mammal"
            },
            {
                "description": "tiger face",
                "emoticon": "🐯",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-mammal"
            },
            {
                "description": "cow face",
                "emoticon": "🐮",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-mammal"
            },
            {
                "description": "mouse face",
                "emoticon": "🐭",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-mammal"
            },
            {
                "description": "two-hump camel",
                "emoticon": "🐫",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-mammal"
            },
            {
                "description": "camel",
                "emoticon": "🐪",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-mammal"
            },
            {
                "description": "poodle",
                "emoticon": "🐩",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-mammal"
            },
            {
                "description": "koala",
                "emoticon": "🐨",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-mammal"
            },
            {
                "description": "elephant",
                "emoticon": "🐘",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-mammal"
            },
            {
                "description": "boar",
                "emoticon": "🐗",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-mammal"
            },
            {
                "description": "pig",
                "emoticon": "🐖",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-mammal"
            },
            {
                "description": "dog",
                "emoticon": "🐕",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-mammal"
            },
            {
                "description": "service dog",
                "emoticon": "🐕‍🦺",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-mammal"
            },
            {
                "description": "monkey",
                "emoticon": "🐒",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-mammal"
            },
            {
                "description": "ewe",
                "emoticon": "🐑",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-mammal"
            },
            {
                "description": "goat",
                "emoticon": "🐐",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-mammal"
            },
            {
                "description": "ram",
                "emoticon": "🐏",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-mammal"
            },
            {
                "description": "horse",
                "emoticon": "🐎",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-mammal"
            },
            {
                "description": "cat",
                "emoticon": "🐈",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-mammal"
            },
            {
                "description": "black cat",
                "emoticon": "🐈‍⬛",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-mammal"
            },
            {
                "description": "rabbit",
                "emoticon": "🐇",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-mammal"
            },
            {
                "description": "leopard",
                "emoticon": "🐆",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-mammal"
            },
            {
                "description": "tiger",
                "emoticon": "🐅",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-mammal"
            },
            {
                "description": "cow",
                "emoticon": "🐄",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-mammal"
            },
            {
                "description": "water buffalo",
                "emoticon": "🐃",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-mammal"
            },
            {
                "description": "ox",
                "emoticon": "🐂",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-mammal"
            },
            {
                "description": "mouse",
                "emoticon": "🐁",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-mammal"
            },
            {
                "description": "rat",
                "emoticon": "🐀",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-mammal"
            }
        ],
        "animal-bird": [
            {
                "description": "flamingo",
                "emoticon": "🦩",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-bird"
            },
            {
                "description": "swan",
                "emoticon": "🦢",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-bird"
            },
            {
                "description": "parrot",
                "emoticon": "🦜",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-bird"
            },
            {
                "description": "peacock",
                "emoticon": "🦚",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-bird"
            },
            {
                "description": "owl",
                "emoticon": "🦉",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-bird"
            },
            {
                "description": "duck",
                "emoticon": "🦆",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-bird"
            },
            {
                "description": "eagle",
                "emoticon": "🦅",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-bird"
            },
            {
                "description": "turkey",
                "emoticon": "🦃",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-bird"
            },
            {
                "description": "dove",
                "emoticon": "🕊️",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-bird"
            },
            {
                "description": "penguin",
                "emoticon": "🐧",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-bird"
            },
            {
                "description": "bird",
                "emoticon": "🐦",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-bird"
            },
            {
                "description": "black bird",
                "emoticon": "🐦‍⬛",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-bird"
            },
            {
                "description": "phoenix",
                "emoticon": "🐦‍🔥",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-bird"
            },
            {
                "description": "front-facing baby chick",
                "emoticon": "🐥",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-bird"
            },
            {
                "description": "baby chick",
                "emoticon": "🐤",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-bird"
            },
            {
                "description": "hatching chick",
                "emoticon": "🐣",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-bird"
            },
            {
                "description": "chicken",
                "emoticon": "🐔",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-bird"
            },
            {
                "description": "rooster",
                "emoticon": "🐓",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-bird"
            }
        ],
        "animal-amphibian": [
            {
                "description": "frog",
                "emoticon": "🐸",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-amphibian"
            }
        ],
        "animal-reptile": [
            {
                "description": "T-Rex",
                "emoticon": "🦖",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-reptile"
            },
            {
                "description": "sauropod",
                "emoticon": "🦕",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-reptile"
            },
            {
                "description": "lizard",
                "emoticon": "🦎",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-reptile"
            },
            {
                "description": "dragon face",
                "emoticon": "🐲",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-reptile"
            },
            {
                "description": "turtle",
                "emoticon": "🐢",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-reptile"
            },
            {
                "description": "snake",
                "emoticon": "🐍",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-reptile"
            },
            {
                "description": "crocodile",
                "emoticon": "🐊",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-reptile"
            },
            {
                "description": "dragon",
                "emoticon": "🐉",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-reptile"
            }
        ],
        "animal-marine": [
            {
                "description": "shark",
                "emoticon": "🦈",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-marine"
            },
            {
                "description": "spouting whale",
                "emoticon": "🐳",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-marine"
            },
            {
                "description": "dolphin",
                "emoticon": "🐬",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-marine"
            },
            {
                "description": "blowfish",
                "emoticon": "🐡",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-marine"
            },
            {
                "description": "tropical fish",
                "emoticon": "🐠",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-marine"
            },
            {
                "description": "fish",
                "emoticon": "🐟",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-marine"
            },
            {
                "description": "spiral shell",
                "emoticon": "🐚",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-marine"
            },
            {
                "description": "octopus",
                "emoticon": "🐙",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-marine"
            },
            {
                "description": "whale",
                "emoticon": "🐋",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-marine"
            }
        ],
        "animal-bug": [
            {
                "description": "microbe",
                "emoticon": "🦠",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-bug"
            },
            {
                "description": "mosquito",
                "emoticon": "🦟",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-bug"
            },
            {
                "description": "cricket",
                "emoticon": "🦗",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-bug"
            },
            {
                "description": "butterfly",
                "emoticon": "🦋",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-bug"
            },
            {
                "description": "scorpion",
                "emoticon": "🦂",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-bug"
            },
            {
                "description": "spider web",
                "emoticon": "🕸️",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-bug"
            },
            {
                "description": "spider",
                "emoticon": "🕷️",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-bug"
            },
            {
                "description": "lady beetle",
                "emoticon": "🐞",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-bug"
            },
            {
                "description": "honeybee",
                "emoticon": "🐝",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-bug"
            },
            {
                "description": "ant",
                "emoticon": "🐜",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-bug"
            },
            {
                "description": "bug",
                "emoticon": "🐛",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-bug"
            },
            {
                "description": "snail",
                "emoticon": "🐌",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "animal-bug"
            }
        ],
        "plant-flower": [
            {
                "description": "wilted flower",
                "emoticon": "🥀",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "plant-flower"
            },
            {
                "description": "white flower",
                "emoticon": "💮",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "plant-flower"
            },
            {
                "description": "bouquet",
                "emoticon": "💐",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "plant-flower"
            },
            {
                "description": "rosette",
                "emoticon": "🏵️",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "plant-flower"
            },
            {
                "description": "blossom",
                "emoticon": "🌼",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "plant-flower"
            },
            {
                "description": "sunflower",
                "emoticon": "🌻",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "plant-flower"
            },
            {
                "description": "hibiscus",
                "emoticon": "🌺",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "plant-flower"
            },
            {
                "description": "rose",
                "emoticon": "🌹",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "plant-flower"
            },
            {
                "description": "cherry blossom",
                "emoticon": "🌸",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "plant-flower"
            },
            {
                "description": "tulip",
                "emoticon": "🌷",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "plant-flower"
            }
        ],
        "plant-other": [
            {
                "description": "mushroom",
                "emoticon": "🍄",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "plant-other"
            },
            {
                "description": "leaf fluttering in wind",
                "emoticon": "🍃",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "plant-other"
            },
            {
                "description": "fallen leaf",
                "emoticon": "🍂",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "plant-other"
            },
            {
                "description": "maple leaf",
                "emoticon": "🍁",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "plant-other"
            },
            {
                "description": "four leaf clover",
                "emoticon": "🍀",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "plant-other"
            },
            {
                "description": "herb",
                "emoticon": "🌿",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "plant-other"
            },
            {
                "description": "sheaf of rice",
                "emoticon": "🌾",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "plant-other"
            },
            {
                "description": "cactus",
                "emoticon": "🌵",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "plant-other"
            },
            {
                "description": "palm tree",
                "emoticon": "🌴",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "plant-other"
            },
            {
                "description": "deciduous tree",
                "emoticon": "🌳",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "plant-other"
            },
            {
                "description": "evergreen tree",
                "emoticon": "🌲",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "plant-other"
            },
            {
                "description": "seedling",
                "emoticon": "🌱",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "plant-other"
            },
            {
                "description": "shamrock",
                "emoticon": "☘️",
                "toneType": [],
                "groupTitle": "Animals & Nature",
                "subgroupTitle": "plant-other"
            }
        ]
    },
    "Food & Drink": {
        "food-fruit": [
            {
                "description": "mango",
                "emoticon": "🥭",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "food-fruit"
            },
            {
                "description": "coconut",
                "emoticon": "🥥",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "food-fruit"
            },
            {
                "description": "kiwi fruit",
                "emoticon": "🥝",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "food-fruit"
            },
            {
                "description": "strawberry",
                "emoticon": "🍓",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "food-fruit"
            },
            {
                "description": "cherries",
                "emoticon": "🍒",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "food-fruit"
            },
            {
                "description": "peach",
                "emoticon": "🍑",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "food-fruit"
            },
            {
                "description": "pear",
                "emoticon": "🍐",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "food-fruit"
            },
            {
                "description": "green apple",
                "emoticon": "🍏",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "food-fruit"
            },
            {
                "description": "red apple",
                "emoticon": "🍎",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "food-fruit"
            },
            {
                "description": "pineapple",
                "emoticon": "🍍",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "food-fruit"
            },
            {
                "description": "banana",
                "emoticon": "🍌",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "food-fruit"
            },
            {
                "description": "lemon",
                "emoticon": "🍋",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "food-fruit"
            },
            {
                "description": "lime",
                "emoticon": "🍋‍🟩",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "food-fruit"
            },
            {
                "description": "tangerine",
                "emoticon": "🍊",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "food-fruit"
            },
            {
                "description": "watermelon",
                "emoticon": "🍉",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "food-fruit"
            },
            {
                "description": "melon",
                "emoticon": "🍈",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "food-fruit"
            },
            {
                "description": "grapes",
                "emoticon": "🍇",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "food-fruit"
            },
            {
                "description": "tomato",
                "emoticon": "🍅",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "food-fruit"
            }
        ],
        "food-vegetable": [
            {
                "description": "onion",
                "emoticon": "🧅",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "food-vegetable"
            },
            {
                "description": "garlic",
                "emoticon": "🧄",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "food-vegetable"
            },
            {
                "description": "leafy green",
                "emoticon": "🥬",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "food-vegetable"
            },
            {
                "description": "broccoli",
                "emoticon": "🥦",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "food-vegetable"
            },
            {
                "description": "peanuts",
                "emoticon": "🥜",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "food-vegetable"
            },
            {
                "description": "carrot",
                "emoticon": "🥕",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "food-vegetable"
            },
            {
                "description": "potato",
                "emoticon": "🥔",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "food-vegetable"
            },
            {
                "description": "cucumber",
                "emoticon": "🥒",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "food-vegetable"
            },
            {
                "description": "avocado",
                "emoticon": "🥑",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "food-vegetable"
            },
            {
                "description": "eggplant",
                "emoticon": "🍆",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "food-vegetable"
            },
            {
                "description": "brown mushroom",
                "emoticon": "🍄‍🟫",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "food-vegetable"
            },
            {
                "description": "ear of corn",
                "emoticon": "🌽",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "food-vegetable"
            },
            {
                "description": "hot pepper",
                "emoticon": "🌶️",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "food-vegetable"
            },
            {
                "description": "chestnut",
                "emoticon": "🌰",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "food-vegetable"
            }
        ],
        "food-prepared": [
            {
                "description": "butter",
                "emoticon": "🧈",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "food-prepared"
            },
            {
                "description": "waffle",
                "emoticon": "🧇",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "food-prepared"
            },
            {
                "description": "falafel",
                "emoticon": "🧆",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "food-prepared"
            },
            {
                "description": "salt",
                "emoticon": "🧂",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "food-prepared"
            },
            {
                "description": "cheese wedge",
                "emoticon": "🧀",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "food-prepared"
            },
            {
                "description": "bagel",
                "emoticon": "🥯",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "food-prepared"
            },
            {
                "description": "canned food",
                "emoticon": "🥫",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "food-prepared"
            },
            {
                "description": "sandwich",
                "emoticon": "🥪",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "food-prepared"
            },
            {
                "description": "cut of meat",
                "emoticon": "🥩",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "food-prepared"
            },
            {
                "description": "pretzel",
                "emoticon": "🥨",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "food-prepared"
            },
            {
                "description": "bowl with spoon",
                "emoticon": "🥣",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "food-prepared"
            },
            {
                "description": "pancakes",
                "emoticon": "🥞",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "food-prepared"
            },
            {
                "description": "egg",
                "emoticon": "🥚",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "food-prepared"
            },
            {
                "description": "stuffed flatbread",
                "emoticon": "🥙",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "food-prepared"
            },
            {
                "description": "shallow pan of food",
                "emoticon": "🥘",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "food-prepared"
            },
            {
                "description": "green salad",
                "emoticon": "🥗",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "food-prepared"
            },
            {
                "description": "baguette bread",
                "emoticon": "🥖",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "food-prepared"
            },
            {
                "description": "bacon",
                "emoticon": "🥓",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "food-prepared"
            },
            {
                "description": "croissant",
                "emoticon": "🥐",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "food-prepared"
            },
            {
                "description": "popcorn",
                "emoticon": "🍿",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "food-prepared"
            },
            {
                "description": "cooking",
                "emoticon": "🍳",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "food-prepared"
            },
            {
                "description": "pot of food",
                "emoticon": "🍲",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "food-prepared"
            },
            {
                "description": "french fries",
                "emoticon": "🍟",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "food-prepared"
            },
            {
                "description": "bread",
                "emoticon": "🍞",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "food-prepared"
            },
            {
                "description": "poultry leg",
                "emoticon": "🍗",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "food-prepared"
            },
            {
                "description": "meat on bone",
                "emoticon": "🍖",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "food-prepared"
            },
            {
                "description": "pizza",
                "emoticon": "🍕",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "food-prepared"
            },
            {
                "description": "hamburger",
                "emoticon": "🍔",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "food-prepared"
            },
            {
                "description": "burrito",
                "emoticon": "🌯",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "food-prepared"
            },
            {
                "description": "taco",
                "emoticon": "🌮",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "food-prepared"
            },
            {
                "description": "hot dog",
                "emoticon": "🌭",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "food-prepared"
            }
        ],
        "food-asian": [
            {
                "description": "moon cake",
                "emoticon": "🥮",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "food-asian"
            },
            {
                "description": "takeout box",
                "emoticon": "🥡",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "food-asian"
            },
            {
                "description": "fortune cookie",
                "emoticon": "🥠",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "food-asian"
            },
            {
                "description": "dumpling",
                "emoticon": "🥟",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "food-asian"
            },
            {
                "description": "bento box",
                "emoticon": "🍱",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "food-asian"
            },
            {
                "description": "fish cake with swirl",
                "emoticon": "🍥",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "food-asian"
            },
            {
                "description": "fried shrimp",
                "emoticon": "🍤",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "food-asian"
            },
            {
                "description": "sushi",
                "emoticon": "🍣",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "food-asian"
            },
            {
                "description": "oden",
                "emoticon": "🍢",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "food-asian"
            },
            {
                "description": "dango",
                "emoticon": "🍡",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "food-asian"
            },
            {
                "description": "roasted sweet potato",
                "emoticon": "🍠",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "food-asian"
            },
            {
                "description": "spaghetti",
                "emoticon": "🍝",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "food-asian"
            },
            {
                "description": "steaming bowl",
                "emoticon": "🍜",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "food-asian"
            },
            {
                "description": "curry rice",
                "emoticon": "🍛",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "food-asian"
            },
            {
                "description": "cooked rice",
                "emoticon": "🍚",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "food-asian"
            },
            {
                "description": "rice ball",
                "emoticon": "🍙",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "food-asian"
            },
            {
                "description": "rice cracker",
                "emoticon": "🍘",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "food-asian"
            }
        ],
        "food-marine": [
            {
                "description": "oyster",
                "emoticon": "🦪",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "food-marine"
            },
            {
                "description": "lobster",
                "emoticon": "🦞",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "food-marine"
            },
            {
                "description": "squid",
                "emoticon": "🦑",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "food-marine"
            },
            {
                "description": "shrimp",
                "emoticon": "🦐",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "food-marine"
            },
            {
                "description": "crab",
                "emoticon": "🦀",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "food-marine"
            }
        ],
        "food-sweet": [
            {
                "description": "cupcake",
                "emoticon": "🧁",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "food-sweet"
            },
            {
                "description": "pie",
                "emoticon": "🥧",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "food-sweet"
            },
            {
                "description": "birthday cake",
                "emoticon": "🎂",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "food-sweet"
            },
            {
                "description": "shortcake",
                "emoticon": "🍰",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "food-sweet"
            },
            {
                "description": "honey pot",
                "emoticon": "🍯",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "food-sweet"
            },
            {
                "description": "custard",
                "emoticon": "🍮",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "food-sweet"
            },
            {
                "description": "lollipop",
                "emoticon": "🍭",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "food-sweet"
            },
            {
                "description": "candy",
                "emoticon": "🍬",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "food-sweet"
            },
            {
                "description": "chocolate bar",
                "emoticon": "🍫",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "food-sweet"
            },
            {
                "description": "cookie",
                "emoticon": "🍪",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "food-sweet"
            },
            {
                "description": "doughnut",
                "emoticon": "🍩",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "food-sweet"
            },
            {
                "description": "ice cream",
                "emoticon": "🍨",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "food-sweet"
            },
            {
                "description": "shaved ice",
                "emoticon": "🍧",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "food-sweet"
            },
            {
                "description": "soft ice cream",
                "emoticon": "🍦",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "food-sweet"
            }
        ],
        "drink": [
            {
                "description": "ice",
                "emoticon": "🧊",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "drink"
            },
            {
                "description": "mate",
                "emoticon": "🧉",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "drink"
            },
            {
                "description": "beverage box",
                "emoticon": "🧃",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "drink"
            },
            {
                "description": "cup with straw",
                "emoticon": "🥤",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "drink"
            },
            {
                "description": "glass of milk",
                "emoticon": "🥛",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "drink"
            },
            {
                "description": "tumbler glass",
                "emoticon": "🥃",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "drink"
            },
            {
                "description": "clinking glasses",
                "emoticon": "🥂",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "drink"
            },
            {
                "description": "bottle with popping cork",
                "emoticon": "🍾",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "drink"
            },
            {
                "description": "baby bottle",
                "emoticon": "🍼",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "drink"
            },
            {
                "description": "clinking beer mugs",
                "emoticon": "🍻",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "drink"
            },
            {
                "description": "beer mug",
                "emoticon": "🍺",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "drink"
            },
            {
                "description": "tropical drink",
                "emoticon": "🍹",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "drink"
            },
            {
                "description": "cocktail glass",
                "emoticon": "🍸",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "drink"
            },
            {
                "description": "wine glass",
                "emoticon": "🍷",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "drink"
            },
            {
                "description": "sake",
                "emoticon": "🍶",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "drink"
            },
            {
                "description": "teacup without handle",
                "emoticon": "🍵",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "drink"
            },
            {
                "description": "hot beverage",
                "emoticon": "☕",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "drink"
            }
        ],
        "dishware": [
            {
                "description": "chopsticks",
                "emoticon": "🥢",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "dishware"
            },
            {
                "description": "spoon",
                "emoticon": "🥄",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "dishware"
            },
            {
                "description": "kitchen knife",
                "emoticon": "🔪",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "dishware"
            },
            {
                "description": "amphora",
                "emoticon": "🏺",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "dishware"
            },
            {
                "description": "fork and knife with plate",
                "emoticon": "🍽️",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "dishware"
            },
            {
                "description": "fork and knife",
                "emoticon": "🍴",
                "toneType": [],
                "groupTitle": "Food & Drink",
                "subgroupTitle": "dishware"
            }
        ]
    },
    "Travel & Places": {
        "place-map": [
            {
                "description": "compass",
                "emoticon": "🧭",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "place-map"
            },
            {
                "description": "map of Japan",
                "emoticon": "🗾",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "place-map"
            },
            {
                "description": "world map",
                "emoticon": "🗺️",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "place-map"
            },
            {
                "description": "globe with meridians",
                "emoticon": "🌐",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "place-map"
            },
            {
                "description": "globe showing Asia-Australia",
                "emoticon": "🌏",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "place-map"
            },
            {
                "description": "globe showing Americas",
                "emoticon": "🌎",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "place-map"
            },
            {
                "description": "globe showing Europe-Africa",
                "emoticon": "🌍",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "place-map"
            }
        ],
        "place-geographic": [
            {
                "description": "mount fuji",
                "emoticon": "🗻",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "place-geographic"
            },
            {
                "description": "national park",
                "emoticon": "🏞️",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "place-geographic"
            },
            {
                "description": "desert island",
                "emoticon": "🏝️",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "place-geographic"
            },
            {
                "description": "desert",
                "emoticon": "🏜️",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "place-geographic"
            },
            {
                "description": "beach with umbrella",
                "emoticon": "🏖️",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "place-geographic"
            },
            {
                "description": "camping",
                "emoticon": "🏕️",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "place-geographic"
            },
            {
                "description": "snow-capped mountain",
                "emoticon": "🏔️",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "place-geographic"
            },
            {
                "description": "volcano",
                "emoticon": "🌋",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "place-geographic"
            },
            {
                "description": "mountain",
                "emoticon": "⛰️",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "place-geographic"
            }
        ],
        "place-building": [
            {
                "description": "brick",
                "emoticon": "🧱",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "place-building"
            },
            {
                "description": "Statue of Liberty",
                "emoticon": "🗽",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "place-building"
            },
            {
                "description": "Tokyo tower",
                "emoticon": "🗼",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "place-building"
            },
            {
                "description": "wedding",
                "emoticon": "💒",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "place-building"
            },
            {
                "description": "castle",
                "emoticon": "🏰",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "place-building"
            },
            {
                "description": "Japanese castle",
                "emoticon": "🏯",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "place-building"
            },
            {
                "description": "factory",
                "emoticon": "🏭",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "place-building"
            },
            {
                "description": "department store",
                "emoticon": "🏬",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "place-building"
            },
            {
                "description": "school",
                "emoticon": "🏫",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "place-building"
            },
            {
                "description": "convenience store",
                "emoticon": "🏪",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "place-building"
            },
            {
                "description": "love hotel",
                "emoticon": "🏩",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "place-building"
            },
            {
                "description": "hotel",
                "emoticon": "🏨",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "place-building"
            },
            {
                "description": "bank",
                "emoticon": "🏦",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "place-building"
            },
            {
                "description": "hospital",
                "emoticon": "🏥",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "place-building"
            },
            {
                "description": "post office",
                "emoticon": "🏤",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "place-building"
            },
            {
                "description": "Japanese post office",
                "emoticon": "🏣",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "place-building"
            },
            {
                "description": "office building",
                "emoticon": "🏢",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "place-building"
            },
            {
                "description": "house with garden",
                "emoticon": "🏡",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "place-building"
            },
            {
                "description": "house",
                "emoticon": "🏠",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "place-building"
            },
            {
                "description": "stadium",
                "emoticon": "🏟️",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "place-building"
            },
            {
                "description": "classical building",
                "emoticon": "🏛️",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "place-building"
            },
            {
                "description": "derelict house",
                "emoticon": "🏚️",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "place-building"
            },
            {
                "description": "houses",
                "emoticon": "🏘️",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "place-building"
            },
            {
                "description": "building construction",
                "emoticon": "🏗️",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "place-building"
            }
        ],
        "place-religious": [
            {
                "description": "hindu temple",
                "emoticon": "🛕",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "place-religious"
            },
            {
                "description": "synagogue",
                "emoticon": "🕍",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "place-religious"
            },
            {
                "description": "mosque",
                "emoticon": "🕌",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "place-religious"
            },
            {
                "description": "kaaba",
                "emoticon": "🕋",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "place-religious"
            },
            {
                "description": "church",
                "emoticon": "⛪",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "place-religious"
            },
            {
                "description": "shinto shrine",
                "emoticon": "⛩️",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "place-religious"
            }
        ],
        "place-other": [
            {
                "description": "barber pole",
                "emoticon": "💈",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "place-other"
            },
            {
                "description": "cityscape",
                "emoticon": "🏙️",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "place-other"
            },
            {
                "description": "circus tent",
                "emoticon": "🎪",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "place-other"
            },
            {
                "description": "roller coaster",
                "emoticon": "🎢",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "place-other"
            },
            {
                "description": "ferris wheel",
                "emoticon": "🎡",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "place-other"
            },
            {
                "description": "carousel horse",
                "emoticon": "🎠",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "place-other"
            },
            {
                "description": "bridge at night",
                "emoticon": "🌉",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "place-other"
            },
            {
                "description": "sunset",
                "emoticon": "🌇",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "place-other"
            },
            {
                "description": "cityscape at dusk",
                "emoticon": "🌆",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "place-other"
            },
            {
                "description": "sunrise",
                "emoticon": "🌅",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "place-other"
            },
            {
                "description": "sunrise over mountains",
                "emoticon": "🌄",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "place-other"
            },
            {
                "description": "night with stars",
                "emoticon": "🌃",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "place-other"
            },
            {
                "description": "foggy",
                "emoticon": "🌁",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "place-other"
            },
            {
                "description": "tent",
                "emoticon": "⛺",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "place-other"
            },
            {
                "description": "fountain",
                "emoticon": "⛲",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "place-other"
            },
            {
                "description": "hot springs",
                "emoticon": "♨️",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "place-other"
            }
        ],
        "transport-ground": [
            {
                "description": "manual wheelchair",
                "emoticon": "🦽",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "transport-ground"
            },
            {
                "description": "motorized wheelchair",
                "emoticon": "🦼",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "transport-ground"
            },
            {
                "description": "auto rickshaw",
                "emoticon": "🛺",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "transport-ground"
            },
            {
                "description": "skateboard",
                "emoticon": "🛹",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "transport-ground"
            },
            {
                "description": "motor scooter",
                "emoticon": "🛵",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "transport-ground"
            },
            {
                "description": "kick scooter",
                "emoticon": "🛴",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "transport-ground"
            },
            {
                "description": "railway track",
                "emoticon": "🛤️",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "transport-ground"
            },
            {
                "description": "motorway",
                "emoticon": "🛣️",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "transport-ground"
            },
            {
                "description": "oil drum",
                "emoticon": "🛢️",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "transport-ground"
            },
            {
                "description": "stop sign",
                "emoticon": "🛑",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "transport-ground"
            },
            {
                "description": "bicycle",
                "emoticon": "🚲",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "transport-ground"
            },
            {
                "description": "police car light",
                "emoticon": "🚨",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "transport-ground"
            },
            {
                "description": "construction",
                "emoticon": "🚧",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "transport-ground"
            },
            {
                "description": "vertical traffic light",
                "emoticon": "🚦",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "transport-ground"
            },
            {
                "description": "horizontal traffic light",
                "emoticon": "🚥",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "transport-ground"
            },
            {
                "description": "mountain railway",
                "emoticon": "🚞",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "transport-ground"
            },
            {
                "description": "monorail",
                "emoticon": "🚝",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "transport-ground"
            },
            {
                "description": "tractor",
                "emoticon": "🚜",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "transport-ground"
            },
            {
                "description": "articulated lorry",
                "emoticon": "🚛",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "transport-ground"
            },
            {
                "description": "delivery truck",
                "emoticon": "🚚",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "transport-ground"
            },
            {
                "description": "sport utility vehicle",
                "emoticon": "🚙",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "transport-ground"
            },
            {
                "description": "oncoming automobile",
                "emoticon": "🚘",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "transport-ground"
            },
            {
                "description": "automobile",
                "emoticon": "🚗",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "transport-ground"
            },
            {
                "description": "oncoming taxi",
                "emoticon": "🚖",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "transport-ground"
            },
            {
                "description": "taxi",
                "emoticon": "🚕",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "transport-ground"
            },
            {
                "description": "oncoming police car",
                "emoticon": "🚔",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "transport-ground"
            },
            {
                "description": "police car",
                "emoticon": "🚓",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "transport-ground"
            },
            {
                "description": "fire engine",
                "emoticon": "🚒",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "transport-ground"
            },
            {
                "description": "ambulance",
                "emoticon": "🚑",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "transport-ground"
            },
            {
                "description": "minibus",
                "emoticon": "🚐",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "transport-ground"
            },
            {
                "description": "bus stop",
                "emoticon": "🚏",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "transport-ground"
            },
            {
                "description": "trolleybus",
                "emoticon": "🚎",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "transport-ground"
            },
            {
                "description": "oncoming bus",
                "emoticon": "🚍",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "transport-ground"
            },
            {
                "description": "bus",
                "emoticon": "🚌",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "transport-ground"
            },
            {
                "description": "tram car",
                "emoticon": "🚋",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "transport-ground"
            },
            {
                "description": "tram",
                "emoticon": "🚊",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "transport-ground"
            },
            {
                "description": "station",
                "emoticon": "🚉",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "transport-ground"
            },
            {
                "description": "light rail",
                "emoticon": "🚈",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "transport-ground"
            },
            {
                "description": "metro",
                "emoticon": "🚇",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "transport-ground"
            },
            {
                "description": "train",
                "emoticon": "🚆",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "transport-ground"
            },
            {
                "description": "bullet train",
                "emoticon": "🚅",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "transport-ground"
            },
            {
                "description": "high-speed train",
                "emoticon": "🚄",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "transport-ground"
            },
            {
                "description": "railway car",
                "emoticon": "🚃",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "transport-ground"
            },
            {
                "description": "locomotive",
                "emoticon": "🚂",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "transport-ground"
            },
            {
                "description": "racing car",
                "emoticon": "🏎️",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "transport-ground"
            },
            {
                "description": "motorcycle",
                "emoticon": "🏍️",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "transport-ground"
            },
            {
                "description": "fuel pump",
                "emoticon": "⛽",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "transport-ground"
            }
        ],
        "transport-water": [
            {
                "description": "canoe",
                "emoticon": "🛶",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "transport-water"
            },
            {
                "description": "passenger ship",
                "emoticon": "🛳️",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "transport-water"
            },
            {
                "description": "motor boat",
                "emoticon": "🛥️",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "transport-water"
            },
            {
                "description": "speedboat",
                "emoticon": "🚤",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "transport-water"
            },
            {
                "description": "ship",
                "emoticon": "🚢",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "transport-water"
            },
            {
                "description": "sailboat",
                "emoticon": "⛵",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "transport-water"
            },
            {
                "description": "ferry",
                "emoticon": "⛴️",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "transport-water"
            },
            {
                "description": "anchor",
                "emoticon": "⚓",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "transport-water"
            }
        ],
        "transport-air": [
            {
                "description": "parachute",
                "emoticon": "🪂",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "transport-air"
            },
            {
                "description": "flying saucer",
                "emoticon": "🛸",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "transport-air"
            },
            {
                "description": "satellite",
                "emoticon": "🛰️",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "transport-air"
            },
            {
                "description": "airplane arrival",
                "emoticon": "🛬",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "transport-air"
            },
            {
                "description": "airplane departure",
                "emoticon": "🛫",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "transport-air"
            },
            {
                "description": "small airplane",
                "emoticon": "🛩️",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "transport-air"
            },
            {
                "description": "aerial tramway",
                "emoticon": "🚡",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "transport-air"
            },
            {
                "description": "mountain cableway",
                "emoticon": "🚠",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "transport-air"
            },
            {
                "description": "suspension railway",
                "emoticon": "🚟",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "transport-air"
            },
            {
                "description": "helicopter",
                "emoticon": "🚁",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "transport-air"
            },
            {
                "description": "rocket",
                "emoticon": "🚀",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "transport-air"
            },
            {
                "description": "seat",
                "emoticon": "💺",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "transport-air"
            },
            {
                "description": "airplane",
                "emoticon": "✈️",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "transport-air"
            }
        ],
        "hotel": [
            {
                "description": "luggage",
                "emoticon": "🧳",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "hotel"
            },
            {
                "description": "bellhop bell",
                "emoticon": "🛎️",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "hotel"
            }
        ],
        "time": [
            {
                "description": "mantelpiece clock",
                "emoticon": "🕰️",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "time"
            },
            {
                "description": "twelve-thirty",
                "emoticon": "🕧",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "time"
            },
            {
                "description": "eleven-thirty",
                "emoticon": "🕦",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "time"
            },
            {
                "description": "ten-thirty",
                "emoticon": "🕥",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "time"
            },
            {
                "description": "nine-thirty",
                "emoticon": "🕤",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "time"
            },
            {
                "description": "eight-thirty",
                "emoticon": "🕣",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "time"
            },
            {
                "description": "seven-thirty",
                "emoticon": "🕢",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "time"
            },
            {
                "description": "six-thirty",
                "emoticon": "🕡",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "time"
            },
            {
                "description": "five-thirty",
                "emoticon": "🕠",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "time"
            },
            {
                "description": "four-thirty",
                "emoticon": "🕟",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "time"
            },
            {
                "description": "three-thirty",
                "emoticon": "🕞",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "time"
            },
            {
                "description": "two-thirty",
                "emoticon": "🕝",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "time"
            },
            {
                "description": "one-thirty",
                "emoticon": "🕜",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "time"
            },
            {
                "description": "twelve o’clock",
                "emoticon": "🕛",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "time"
            },
            {
                "description": "eleven o’clock",
                "emoticon": "🕚",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "time"
            },
            {
                "description": "ten o’clock",
                "emoticon": "🕙",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "time"
            },
            {
                "description": "nine o’clock",
                "emoticon": "🕘",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "time"
            },
            {
                "description": "eight o’clock",
                "emoticon": "🕗",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "time"
            },
            {
                "description": "seven o’clock",
                "emoticon": "🕖",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "time"
            },
            {
                "description": "six o’clock",
                "emoticon": "🕕",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "time"
            },
            {
                "description": "five o’clock",
                "emoticon": "🕔",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "time"
            },
            {
                "description": "four o’clock",
                "emoticon": "🕓",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "time"
            },
            {
                "description": "three o’clock",
                "emoticon": "🕒",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "time"
            },
            {
                "description": "two o’clock",
                "emoticon": "🕑",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "time"
            },
            {
                "description": "one o’clock",
                "emoticon": "🕐",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "time"
            },
            {
                "description": "hourglass not done",
                "emoticon": "⏳",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "time"
            },
            {
                "description": "timer clock",
                "emoticon": "⏲️",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "time"
            },
            {
                "description": "stopwatch",
                "emoticon": "⏱️",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "time"
            },
            {
                "description": "alarm clock",
                "emoticon": "⏰",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "time"
            },
            {
                "description": "hourglass done",
                "emoticon": "⌛",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "time"
            },
            {
                "description": "watch",
                "emoticon": "⌚",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "time"
            }
        ],
        "sky & weather": [
            {
                "description": "ringed planet",
                "emoticon": "🪐",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "sky & weather"
            },
            {
                "description": "fire",
                "emoticon": "🔥",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "sky & weather"
            },
            {
                "description": "droplet",
                "emoticon": "💧",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "sky & weather"
            },
            {
                "description": "wind face",
                "emoticon": "🌬️",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "sky & weather"
            },
            {
                "description": "fog",
                "emoticon": "🌫️",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "sky & weather"
            },
            {
                "description": "tornado",
                "emoticon": "🌪️",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "sky & weather"
            },
            {
                "description": "cloud with lightning",
                "emoticon": "🌩️",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "sky & weather"
            },
            {
                "description": "cloud with snow",
                "emoticon": "🌨️",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "sky & weather"
            },
            {
                "description": "cloud with rain",
                "emoticon": "🌧️",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "sky & weather"
            },
            {
                "description": "sun behind rain cloud",
                "emoticon": "🌦️",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "sky & weather"
            },
            {
                "description": "sun behind large cloud",
                "emoticon": "🌥️",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "sky & weather"
            },
            {
                "description": "sun behind small cloud",
                "emoticon": "🌤️",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "sky & weather"
            },
            {
                "description": "thermometer",
                "emoticon": "🌡️",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "sky & weather"
            },
            {
                "description": "shooting star",
                "emoticon": "🌠",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "sky & weather"
            },
            {
                "description": "glowing star",
                "emoticon": "🌟",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "sky & weather"
            },
            {
                "description": "sun with face",
                "emoticon": "🌞",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "sky & weather"
            },
            {
                "description": "full moon face",
                "emoticon": "🌝",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "sky & weather"
            },
            {
                "description": "last quarter moon face",
                "emoticon": "🌜",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "sky & weather"
            },
            {
                "description": "first quarter moon face",
                "emoticon": "🌛",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "sky & weather"
            },
            {
                "description": "new moon face",
                "emoticon": "🌚",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "sky & weather"
            },
            {
                "description": "crescent moon",
                "emoticon": "🌙",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "sky & weather"
            },
            {
                "description": "waning crescent moon",
                "emoticon": "🌘",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "sky & weather"
            },
            {
                "description": "last quarter moon",
                "emoticon": "🌗",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "sky & weather"
            },
            {
                "description": "waning gibbous moon",
                "emoticon": "🌖",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "sky & weather"
            },
            {
                "description": "full moon",
                "emoticon": "🌕",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "sky & weather"
            },
            {
                "description": "waxing gibbous moon",
                "emoticon": "🌔",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "sky & weather"
            },
            {
                "description": "first quarter moon",
                "emoticon": "🌓",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "sky & weather"
            },
            {
                "description": "waxing crescent moon",
                "emoticon": "🌒",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "sky & weather"
            },
            {
                "description": "new moon",
                "emoticon": "🌑",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "sky & weather"
            },
            {
                "description": "milky way",
                "emoticon": "🌌",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "sky & weather"
            },
            {
                "description": "water wave",
                "emoticon": "🌊",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "sky & weather"
            },
            {
                "description": "rainbow",
                "emoticon": "🌈",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "sky & weather"
            },
            {
                "description": "closed umbrella",
                "emoticon": "🌂",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "sky & weather"
            },
            {
                "description": "cyclone",
                "emoticon": "🌀",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "sky & weather"
            },
            {
                "description": "star",
                "emoticon": "⭐",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "sky & weather"
            },
            {
                "description": "snowflake",
                "emoticon": "❄️",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "sky & weather"
            },
            {
                "description": "umbrella on ground",
                "emoticon": "⛱️",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "sky & weather"
            },
            {
                "description": "cloud with lightning and rain",
                "emoticon": "⛈️",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "sky & weather"
            },
            {
                "description": "sun behind cloud",
                "emoticon": "⛅",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "sky & weather"
            },
            {
                "description": "snowman without snow",
                "emoticon": "⛄",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "sky & weather"
            },
            {
                "description": "high voltage",
                "emoticon": "⚡",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "sky & weather"
            },
            {
                "description": "umbrella with rain drops",
                "emoticon": "☔",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "sky & weather"
            },
            {
                "description": "comet",
                "emoticon": "☄️",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "sky & weather"
            },
            {
                "description": "snowman",
                "emoticon": "☃️",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "sky & weather"
            },
            {
                "description": "umbrella",
                "emoticon": "☂️",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "sky & weather"
            },
            {
                "description": "cloud",
                "emoticon": "☁️",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "sky & weather"
            },
            {
                "description": "sun",
                "emoticon": "☀️",
                "toneType": [],
                "groupTitle": "Travel & Places",
                "subgroupTitle": "sky & weather"
            }
        ]
    },
    "Activities": {
        "event": [
            {
                "description": "firecracker",
                "emoticon": "🧨",
                "toneType": [],
                "groupTitle": "Activities",
                "subgroupTitle": "event"
            },
            {
                "description": "red envelope",
                "emoticon": "🧧",
                "toneType": [],
                "groupTitle": "Activities",
                "subgroupTitle": "event"
            },
            {
                "description": "ticket",
                "emoticon": "🎫",
                "toneType": [],
                "groupTitle": "Activities",
                "subgroupTitle": "event"
            },
            {
                "description": "admission tickets",
                "emoticon": "🎟️",
                "toneType": [],
                "groupTitle": "Activities",
                "subgroupTitle": "event"
            },
            {
                "description": "reminder ribbon",
                "emoticon": "🎗️",
                "toneType": [],
                "groupTitle": "Activities",
                "subgroupTitle": "event"
            },
            {
                "description": "moon viewing ceremony",
                "emoticon": "🎑",
                "toneType": [],
                "groupTitle": "Activities",
                "subgroupTitle": "event"
            },
            {
                "description": "wind chime",
                "emoticon": "🎐",
                "toneType": [],
                "groupTitle": "Activities",
                "subgroupTitle": "event"
            },
            {
                "description": "carp streamer",
                "emoticon": "🎏",
                "toneType": [],
                "groupTitle": "Activities",
                "subgroupTitle": "event"
            },
            {
                "description": "Japanese dolls",
                "emoticon": "🎎",
                "toneType": [],
                "groupTitle": "Activities",
                "subgroupTitle": "event"
            },
            {
                "description": "pine decoration",
                "emoticon": "🎍",
                "toneType": [],
                "groupTitle": "Activities",
                "subgroupTitle": "event"
            },
            {
                "description": "tanabata tree",
                "emoticon": "🎋",
                "toneType": [],
                "groupTitle": "Activities",
                "subgroupTitle": "event"
            },
            {
                "description": "confetti ball",
                "emoticon": "🎊",
                "toneType": [],
                "groupTitle": "Activities",
                "subgroupTitle": "event"
            },
            {
                "description": "party popper",
                "emoticon": "🎉",
                "toneType": [],
                "groupTitle": "Activities",
                "subgroupTitle": "event"
            },
            {
                "description": "balloon",
                "emoticon": "🎈",
                "toneType": [],
                "groupTitle": "Activities",
                "subgroupTitle": "event"
            },
            {
                "description": "sparkler",
                "emoticon": "🎇",
                "toneType": [],
                "groupTitle": "Activities",
                "subgroupTitle": "event"
            },
            {
                "description": "fireworks",
                "emoticon": "🎆",
                "toneType": [],
                "groupTitle": "Activities",
                "subgroupTitle": "event"
            },
            {
                "description": "Christmas tree",
                "emoticon": "🎄",
                "toneType": [],
                "groupTitle": "Activities",
                "subgroupTitle": "event"
            },
            {
                "description": "jack-o-lantern",
                "emoticon": "🎃",
                "toneType": [],
                "groupTitle": "Activities",
                "subgroupTitle": "event"
            },
            {
                "description": "wrapped gift",
                "emoticon": "🎁",
                "toneType": [],
                "groupTitle": "Activities",
                "subgroupTitle": "event"
            },
            {
                "description": "ribbon",
                "emoticon": "🎀",
                "toneType": [],
                "groupTitle": "Activities",
                "subgroupTitle": "event"
            },
            {
                "description": "sparkles",
                "emoticon": "✨",
                "toneType": [],
                "groupTitle": "Activities",
                "subgroupTitle": "event"
            }
        ],
        "award-medal": [
            {
                "description": "3rd place medal",
                "emoticon": "🥉",
                "toneType": [],
                "groupTitle": "Activities",
                "subgroupTitle": "award-medal"
            },
            {
                "description": "2nd place medal",
                "emoticon": "🥈",
                "toneType": [],
                "groupTitle": "Activities",
                "subgroupTitle": "award-medal"
            },
            {
                "description": "1st place medal",
                "emoticon": "🥇",
                "toneType": [],
                "groupTitle": "Activities",
                "subgroupTitle": "award-medal"
            },
            {
                "description": "trophy",
                "emoticon": "🏆",
                "toneType": [],
                "groupTitle": "Activities",
                "subgroupTitle": "award-medal"
            },
            {
                "description": "sports medal",
                "emoticon": "🏅",
                "toneType": [],
                "groupTitle": "Activities",
                "subgroupTitle": "award-medal"
            },
            {
                "description": "military medal",
                "emoticon": "🎖️",
                "toneType": [],
                "groupTitle": "Activities",
                "subgroupTitle": "award-medal"
            }
        ],
        "sport": [
            {
                "description": "flying disc",
                "emoticon": "🥏",
                "toneType": [],
                "groupTitle": "Activities",
                "subgroupTitle": "sport"
            },
            {
                "description": "softball",
                "emoticon": "🥎",
                "toneType": [],
                "groupTitle": "Activities",
                "subgroupTitle": "sport"
            },
            {
                "description": "lacrosse",
                "emoticon": "🥍",
                "toneType": [],
                "groupTitle": "Activities",
                "subgroupTitle": "sport"
            },
            {
                "description": "curling stone",
                "emoticon": "🥌",
                "toneType": [],
                "groupTitle": "Activities",
                "subgroupTitle": "sport"
            },
            {
                "description": "martial arts uniform",
                "emoticon": "🥋",
                "toneType": [],
                "groupTitle": "Activities",
                "subgroupTitle": "sport"
            },
            {
                "description": "boxing glove",
                "emoticon": "🥊",
                "toneType": [],
                "groupTitle": "Activities",
                "subgroupTitle": "sport"
            },
            {
                "description": "goal net",
                "emoticon": "🥅",
                "toneType": [],
                "groupTitle": "Activities",
                "subgroupTitle": "sport"
            },
            {
                "description": "diving mask",
                "emoticon": "🤿",
                "toneType": [],
                "groupTitle": "Activities",
                "subgroupTitle": "sport"
            },
            {
                "description": "sled",
                "emoticon": "🛷",
                "toneType": [],
                "groupTitle": "Activities",
                "subgroupTitle": "sport"
            },
            {
                "description": "badminton",
                "emoticon": "🏸",
                "toneType": [],
                "groupTitle": "Activities",
                "subgroupTitle": "sport"
            },
            {
                "description": "ping pong",
                "emoticon": "🏓",
                "toneType": [],
                "groupTitle": "Activities",
                "subgroupTitle": "sport"
            },
            {
                "description": "ice hockey",
                "emoticon": "🏒",
                "toneType": [],
                "groupTitle": "Activities",
                "subgroupTitle": "sport"
            },
            {
                "description": "field hockey",
                "emoticon": "🏑",
                "toneType": [],
                "groupTitle": "Activities",
                "subgroupTitle": "sport"
            },
            {
                "description": "volleyball",
                "emoticon": "🏐",
                "toneType": [],
                "groupTitle": "Activities",
                "subgroupTitle": "sport"
            },
            {
                "description": "cricket game",
                "emoticon": "🏏",
                "toneType": [],
                "groupTitle": "Activities",
                "subgroupTitle": "sport"
            },
            {
                "description": "rugby football",
                "emoticon": "🏉",
                "toneType": [],
                "groupTitle": "Activities",
                "subgroupTitle": "sport"
            },
            {
                "description": "american football",
                "emoticon": "🏈",
                "toneType": [],
                "groupTitle": "Activities",
                "subgroupTitle": "sport"
            },
            {
                "description": "basketball",
                "emoticon": "🏀",
                "toneType": [],
                "groupTitle": "Activities",
                "subgroupTitle": "sport"
            },
            {
                "description": "skis",
                "emoticon": "🎿",
                "toneType": [],
                "groupTitle": "Activities",
                "subgroupTitle": "sport"
            },
            {
                "description": "tennis",
                "emoticon": "🎾",
                "toneType": [],
                "groupTitle": "Activities",
                "subgroupTitle": "sport"
            },
            {
                "description": "running shirt",
                "emoticon": "🎽",
                "toneType": [],
                "groupTitle": "Activities",
                "subgroupTitle": "sport"
            },
            {
                "description": "bowling",
                "emoticon": "🎳",
                "toneType": [],
                "groupTitle": "Activities",
                "subgroupTitle": "sport"
            },
            {
                "description": "fishing pole",
                "emoticon": "🎣",
                "toneType": [],
                "groupTitle": "Activities",
                "subgroupTitle": "sport"
            },
            {
                "description": "ice skate",
                "emoticon": "⛸️",
                "toneType": [],
                "groupTitle": "Activities",
                "subgroupTitle": "sport"
            },
            {
                "description": "flag in hole",
                "emoticon": "⛳",
                "toneType": [],
                "groupTitle": "Activities",
                "subgroupTitle": "sport"
            },
            {
                "description": "baseball",
                "emoticon": "⚾",
                "toneType": [],
                "groupTitle": "Activities",
                "subgroupTitle": "sport"
            },
            {
                "description": "soccer ball",
                "emoticon": "⚽",
                "toneType": [],
                "groupTitle": "Activities",
                "subgroupTitle": "sport"
            }
        ],
        "game": [
            {
                "description": "kite",
                "emoticon": "🪁",
                "toneType": [],
                "groupTitle": "Activities",
                "subgroupTitle": "game"
            },
            {
                "description": "yo-yo",
                "emoticon": "🪀",
                "toneType": [],
                "groupTitle": "Activities",
                "subgroupTitle": "game"
            },
            {
                "description": "teddy bear",
                "emoticon": "🧸",
                "toneType": [],
                "groupTitle": "Activities",
                "subgroupTitle": "game"
            },
            {
                "description": "puzzle piece",
                "emoticon": "🧩",
                "toneType": [],
                "groupTitle": "Activities",
                "subgroupTitle": "game"
            },
            {
                "description": "joystick",
                "emoticon": "🕹️",
                "toneType": [],
                "groupTitle": "Activities",
                "subgroupTitle": "game"
            },
            {
                "description": "crystal ball",
                "emoticon": "🔮",
                "toneType": [],
                "groupTitle": "Activities",
                "subgroupTitle": "game"
            },
            {
                "description": "water pistol",
                "emoticon": "🔫",
                "toneType": [],
                "groupTitle": "Activities",
                "subgroupTitle": "game"
            },
            {
                "description": "flower playing cards",
                "emoticon": "🎴",
                "toneType": [],
                "groupTitle": "Activities",
                "subgroupTitle": "game"
            },
            {
                "description": "game die",
                "emoticon": "🎲",
                "toneType": [],
                "groupTitle": "Activities",
                "subgroupTitle": "game"
            },
            {
                "description": "pool 8 ball",
                "emoticon": "🎱",
                "toneType": [],
                "groupTitle": "Activities",
                "subgroupTitle": "game"
            },
            {
                "description": "slot machine",
                "emoticon": "🎰",
                "toneType": [],
                "groupTitle": "Activities",
                "subgroupTitle": "game"
            },
            {
                "description": "bullseye",
                "emoticon": "🎯",
                "toneType": [],
                "groupTitle": "Activities",
                "subgroupTitle": "game"
            },
            {
                "description": "video game",
                "emoticon": "🎮",
                "toneType": [],
                "groupTitle": "Activities",
                "subgroupTitle": "game"
            },
            {
                "description": "joker",
                "emoticon": "🃏",
                "toneType": [],
                "groupTitle": "Activities",
                "subgroupTitle": "game"
            },
            {
                "description": "mahjong red dragon",
                "emoticon": "🀄",
                "toneType": [],
                "groupTitle": "Activities",
                "subgroupTitle": "game"
            },
            {
                "description": "diamond suit",
                "emoticon": "♦️",
                "toneType": [],
                "groupTitle": "Activities",
                "subgroupTitle": "game"
            },
            {
                "description": "heart suit",
                "emoticon": "♥️",
                "toneType": [],
                "groupTitle": "Activities",
                "subgroupTitle": "game"
            },
            {
                "description": "club suit",
                "emoticon": "♣️",
                "toneType": [],
                "groupTitle": "Activities",
                "subgroupTitle": "game"
            },
            {
                "description": "spade suit",
                "emoticon": "♠️",
                "toneType": [],
                "groupTitle": "Activities",
                "subgroupTitle": "game"
            },
            {
                "description": "chess pawn",
                "emoticon": "♟️",
                "toneType": [],
                "groupTitle": "Activities",
                "subgroupTitle": "game"
            }
        ],
        "arts & crafts": [
            {
                "description": "yarn",
                "emoticon": "🧶",
                "toneType": [],
                "groupTitle": "Activities",
                "subgroupTitle": "arts & crafts"
            },
            {
                "description": "thread",
                "emoticon": "🧵",
                "toneType": [],
                "groupTitle": "Activities",
                "subgroupTitle": "arts & crafts"
            },
            {
                "description": "framed picture",
                "emoticon": "🖼️",
                "toneType": [],
                "groupTitle": "Activities",
                "subgroupTitle": "arts & crafts"
            },
            {
                "description": "performing arts",
                "emoticon": "🎭",
                "toneType": [],
                "groupTitle": "Activities",
                "subgroupTitle": "arts & crafts"
            },
            {
                "description": "artist palette",
                "emoticon": "🎨",
                "toneType": [],
                "groupTitle": "Activities",
                "subgroupTitle": "arts & crafts"
            }
        ]
    },
    "Objects": {
        "clothing": [
            {
                "description": "shorts",
                "emoticon": "🩳",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "clothing"
            },
            {
                "description": "briefs",
                "emoticon": "🩲",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "clothing"
            },
            {
                "description": "one-piece swimsuit",
                "emoticon": "🩱",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "clothing"
            },
            {
                "description": "ballet shoes",
                "emoticon": "🩰",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "clothing"
            },
            {
                "description": "socks",
                "emoticon": "🧦",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "clothing"
            },
            {
                "description": "coat",
                "emoticon": "🧥",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "clothing"
            },
            {
                "description": "gloves",
                "emoticon": "🧤",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "clothing"
            },
            {
                "description": "scarf",
                "emoticon": "🧣",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "clothing"
            },
            {
                "description": "billed cap",
                "emoticon": "🧢",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "clothing"
            },
            {
                "description": "safety vest",
                "emoticon": "🦺",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "clothing"
            },
            {
                "description": "flat shoe",
                "emoticon": "🥿",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "clothing"
            },
            {
                "description": "hiking boot",
                "emoticon": "🥾",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "clothing"
            },
            {
                "description": "goggles",
                "emoticon": "🥽",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "clothing"
            },
            {
                "description": "lab coat",
                "emoticon": "🥼",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "clothing"
            },
            {
                "description": "sari",
                "emoticon": "🥻",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "clothing"
            },
            {
                "description": "shopping bags",
                "emoticon": "🛍️",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "clothing"
            },
            {
                "description": "sunglasses",
                "emoticon": "🕶️",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "clothing"
            },
            {
                "description": "prayer beads",
                "emoticon": "📿",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "clothing"
            },
            {
                "description": "gem stone",
                "emoticon": "💎",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "clothing"
            },
            {
                "description": "ring",
                "emoticon": "💍",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "clothing"
            },
            {
                "description": "lipstick",
                "emoticon": "💄",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "clothing"
            },
            {
                "description": "woman’s boot",
                "emoticon": "👢",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "clothing"
            },
            {
                "description": "woman’s sandal",
                "emoticon": "👡",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "clothing"
            },
            {
                "description": "high-heeled shoe",
                "emoticon": "👠",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "clothing"
            },
            {
                "description": "running shoe",
                "emoticon": "👟",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "clothing"
            },
            {
                "description": "man’s shoe",
                "emoticon": "👞",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "clothing"
            },
            {
                "description": "clutch bag",
                "emoticon": "👝",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "clothing"
            },
            {
                "description": "handbag",
                "emoticon": "👜",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "clothing"
            },
            {
                "description": "purse",
                "emoticon": "👛",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "clothing"
            },
            {
                "description": "woman’s clothes",
                "emoticon": "👚",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "clothing"
            },
            {
                "description": "bikini",
                "emoticon": "👙",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "clothing"
            },
            {
                "description": "kimono",
                "emoticon": "👘",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "clothing"
            },
            {
                "description": "dress",
                "emoticon": "👗",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "clothing"
            },
            {
                "description": "jeans",
                "emoticon": "👖",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "clothing"
            },
            {
                "description": "t-shirt",
                "emoticon": "👕",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "clothing"
            },
            {
                "description": "necktie",
                "emoticon": "👔",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "clothing"
            },
            {
                "description": "glasses",
                "emoticon": "👓",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "clothing"
            },
            {
                "description": "woman’s hat",
                "emoticon": "👒",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "clothing"
            },
            {
                "description": "crown",
                "emoticon": "👑",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "clothing"
            },
            {
                "description": "top hat",
                "emoticon": "🎩",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "clothing"
            },
            {
                "description": "graduation cap",
                "emoticon": "🎓",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "clothing"
            },
            {
                "description": "backpack",
                "emoticon": "🎒",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "clothing"
            },
            {
                "description": "rescue worker’s helmet",
                "emoticon": "⛑️",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "clothing"
            }
        ],
        "sound": [
            {
                "description": "bell with slash",
                "emoticon": "🔕",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "sound"
            },
            {
                "description": "bell",
                "emoticon": "🔔",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "sound"
            },
            {
                "description": "speaker high volume",
                "emoticon": "🔊",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "sound"
            },
            {
                "description": "speaker medium volume",
                "emoticon": "🔉",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "sound"
            },
            {
                "description": "speaker low volume",
                "emoticon": "🔈",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "sound"
            },
            {
                "description": "muted speaker",
                "emoticon": "🔇",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "sound"
            },
            {
                "description": "postal horn",
                "emoticon": "📯",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "sound"
            },
            {
                "description": "megaphone",
                "emoticon": "📣",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "sound"
            },
            {
                "description": "loudspeaker",
                "emoticon": "📢",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "sound"
            }
        ],
        "music": [
            {
                "description": "radio",
                "emoticon": "📻",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "music"
            },
            {
                "description": "musical score",
                "emoticon": "🎼",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "music"
            },
            {
                "description": "musical notes",
                "emoticon": "🎶",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "music"
            },
            {
                "description": "musical note",
                "emoticon": "🎵",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "music"
            },
            {
                "description": "headphone",
                "emoticon": "🎧",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "music"
            },
            {
                "description": "microphone",
                "emoticon": "🎤",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "music"
            },
            {
                "description": "control knobs",
                "emoticon": "🎛️",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "music"
            },
            {
                "description": "level slider",
                "emoticon": "🎚️",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "music"
            },
            {
                "description": "studio microphone",
                "emoticon": "🎙️",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "music"
            }
        ],
        "musical-instrument": [
            {
                "description": "banjo",
                "emoticon": "🪕",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "musical-instrument"
            },
            {
                "description": "drum",
                "emoticon": "🥁",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "musical-instrument"
            },
            {
                "description": "violin",
                "emoticon": "🎻",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "musical-instrument"
            },
            {
                "description": "trumpet",
                "emoticon": "🎺",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "musical-instrument"
            },
            {
                "description": "musical keyboard",
                "emoticon": "🎹",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "musical-instrument"
            },
            {
                "description": "guitar",
                "emoticon": "🎸",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "musical-instrument"
            },
            {
                "description": "saxophone",
                "emoticon": "🎷",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "musical-instrument"
            }
        ],
        "phone": [
            {
                "description": "mobile phone with arrow",
                "emoticon": "📲",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "phone"
            },
            {
                "description": "mobile phone",
                "emoticon": "📱",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "phone"
            },
            {
                "description": "fax machine",
                "emoticon": "📠",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "phone"
            },
            {
                "description": "pager",
                "emoticon": "📟",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "phone"
            },
            {
                "description": "telephone receiver",
                "emoticon": "📞",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "phone"
            },
            {
                "description": "telephone",
                "emoticon": "☎️",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "phone"
            }
        ],
        "computer": [
            {
                "description": "abacus",
                "emoticon": "🧮",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "computer"
            },
            {
                "description": "trackball",
                "emoticon": "🖲️",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "computer"
            },
            {
                "description": "computer mouse",
                "emoticon": "🖱️",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "computer"
            },
            {
                "description": "printer",
                "emoticon": "🖨️",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "computer"
            },
            {
                "description": "desktop computer",
                "emoticon": "🖥️",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "computer"
            },
            {
                "description": "electric plug",
                "emoticon": "🔌",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "computer"
            },
            {
                "description": "battery",
                "emoticon": "🔋",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "computer"
            },
            {
                "description": "dvd",
                "emoticon": "📀",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "computer"
            },
            {
                "description": "optical disk",
                "emoticon": "💿",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "computer"
            },
            {
                "description": "floppy disk",
                "emoticon": "💾",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "computer"
            },
            {
                "description": "computer disk",
                "emoticon": "💽",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "computer"
            },
            {
                "description": "laptop",
                "emoticon": "💻",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "computer"
            },
            {
                "description": "keyboard",
                "emoticon": "⌨️",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "computer"
            }
        ],
        "light & video": [
            {
                "description": "diya lamp",
                "emoticon": "🪔",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "light & video"
            },
            {
                "description": "candle",
                "emoticon": "🕯️",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "light & video"
            },
            {
                "description": "flashlight",
                "emoticon": "🔦",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "light & video"
            },
            {
                "description": "magnifying glass tilted right",
                "emoticon": "🔎",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "light & video"
            },
            {
                "description": "magnifying glass tilted left",
                "emoticon": "🔍",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "light & video"
            },
            {
                "description": "film projector",
                "emoticon": "📽️",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "light & video"
            },
            {
                "description": "videocassette",
                "emoticon": "📼",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "light & video"
            },
            {
                "description": "television",
                "emoticon": "📺",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "light & video"
            },
            {
                "description": "video camera",
                "emoticon": "📹",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "light & video"
            },
            {
                "description": "camera with flash",
                "emoticon": "📸",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "light & video"
            },
            {
                "description": "camera",
                "emoticon": "📷",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "light & video"
            },
            {
                "description": "light bulb",
                "emoticon": "💡",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "light & video"
            },
            {
                "description": "red paper lantern",
                "emoticon": "🏮",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "light & video"
            },
            {
                "description": "clapper board",
                "emoticon": "🎬",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "light & video"
            },
            {
                "description": "movie camera",
                "emoticon": "🎥",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "light & video"
            },
            {
                "description": "film frames",
                "emoticon": "🎞️",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "light & video"
            }
        ],
        "book-paper": [
            {
                "description": "rolled-up newspaper",
                "emoticon": "🗞️",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "book-paper"
            },
            {
                "description": "bookmark",
                "emoticon": "🔖",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "book-paper"
            },
            {
                "description": "newspaper",
                "emoticon": "📰",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "book-paper"
            },
            {
                "description": "scroll",
                "emoticon": "📜",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "book-paper"
            },
            {
                "description": "books",
                "emoticon": "📚",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "book-paper"
            },
            {
                "description": "orange book",
                "emoticon": "📙",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "book-paper"
            },
            {
                "description": "blue book",
                "emoticon": "📘",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "book-paper"
            },
            {
                "description": "green book",
                "emoticon": "📗",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "book-paper"
            },
            {
                "description": "open book",
                "emoticon": "📖",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "book-paper"
            },
            {
                "description": "closed book",
                "emoticon": "📕",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "book-paper"
            },
            {
                "description": "notebook with decorative cover",
                "emoticon": "📔",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "book-paper"
            },
            {
                "description": "notebook",
                "emoticon": "📓",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "book-paper"
            },
            {
                "description": "ledger",
                "emoticon": "📒",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "book-paper"
            },
            {
                "description": "bookmark tabs",
                "emoticon": "📑",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "book-paper"
            },
            {
                "description": "page facing up",
                "emoticon": "📄",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "book-paper"
            },
            {
                "description": "page with curl",
                "emoticon": "📃",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "book-paper"
            },
            {
                "description": "label",
                "emoticon": "🏷️",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "book-paper"
            }
        ],
        "money": [
            {
                "description": "receipt",
                "emoticon": "🧾",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "money"
            },
            {
                "description": "chart increasing with yen",
                "emoticon": "💹",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "money"
            },
            {
                "description": "money with wings",
                "emoticon": "💸",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "money"
            },
            {
                "description": "pound banknote",
                "emoticon": "💷",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "money"
            },
            {
                "description": "euro banknote",
                "emoticon": "💶",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "money"
            },
            {
                "description": "dollar banknote",
                "emoticon": "💵",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "money"
            },
            {
                "description": "yen banknote",
                "emoticon": "💴",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "money"
            },
            {
                "description": "credit card",
                "emoticon": "💳",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "money"
            },
            {
                "description": "money bag",
                "emoticon": "💰",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "money"
            }
        ],
        "mail": [
            {
                "description": "ballot box with ballot",
                "emoticon": "🗳️",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "mail"
            },
            {
                "description": "postbox",
                "emoticon": "📮",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "mail"
            },
            {
                "description": "open mailbox with lowered flag",
                "emoticon": "📭",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "mail"
            },
            {
                "description": "open mailbox with raised flag",
                "emoticon": "📬",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "mail"
            },
            {
                "description": "closed mailbox with raised flag",
                "emoticon": "📫",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "mail"
            },
            {
                "description": "closed mailbox with lowered flag",
                "emoticon": "📪",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "mail"
            },
            {
                "description": "envelope with arrow",
                "emoticon": "📩",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "mail"
            },
            {
                "description": "incoming envelope",
                "emoticon": "📨",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "mail"
            },
            {
                "description": "e-mail",
                "emoticon": "📧",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "mail"
            },
            {
                "description": "package",
                "emoticon": "📦",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "mail"
            },
            {
                "description": "inbox tray",
                "emoticon": "📥",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "mail"
            },
            {
                "description": "outbox tray",
                "emoticon": "📤",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "mail"
            },
            {
                "description": "envelope",
                "emoticon": "✉️",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "mail"
            }
        ],
        "writing": [
            {
                "description": "crayon",
                "emoticon": "🖍️",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "writing"
            },
            {
                "description": "paintbrush",
                "emoticon": "🖌️",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "writing"
            },
            {
                "description": "fountain pen",
                "emoticon": "🖋️",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "writing"
            },
            {
                "description": "pen",
                "emoticon": "🖊️",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "writing"
            },
            {
                "description": "memo",
                "emoticon": "📝",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "writing"
            },
            {
                "description": "black nib",
                "emoticon": "✒️",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "writing"
            },
            {
                "description": "pencil",
                "emoticon": "✏️",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "writing"
            }
        ],
        "office": [
            {
                "description": "spiral calendar",
                "emoticon": "🗓️",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "office"
            },
            {
                "description": "spiral notepad",
                "emoticon": "🗒️",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "office"
            },
            {
                "description": "wastebasket",
                "emoticon": "🗑️",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "office"
            },
            {
                "description": "file cabinet",
                "emoticon": "🗄️",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "office"
            },
            {
                "description": "card file box",
                "emoticon": "🗃️",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "office"
            },
            {
                "description": "card index dividers",
                "emoticon": "🗂️",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "office"
            },
            {
                "description": "linked paperclips",
                "emoticon": "🖇️",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "office"
            },
            {
                "description": "triangular ruler",
                "emoticon": "📐",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "office"
            },
            {
                "description": "straight ruler",
                "emoticon": "📏",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "office"
            },
            {
                "description": "paperclip",
                "emoticon": "📎",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "office"
            },
            {
                "description": "round pushpin",
                "emoticon": "📍",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "office"
            },
            {
                "description": "pushpin",
                "emoticon": "📌",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "office"
            },
            {
                "description": "clipboard",
                "emoticon": "📋",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "office"
            },
            {
                "description": "bar chart",
                "emoticon": "📊",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "office"
            },
            {
                "description": "chart decreasing",
                "emoticon": "📉",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "office"
            },
            {
                "description": "chart increasing",
                "emoticon": "📈",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "office"
            },
            {
                "description": "card index",
                "emoticon": "📇",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "office"
            },
            {
                "description": "tear-off calendar",
                "emoticon": "📆",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "office"
            },
            {
                "description": "calendar",
                "emoticon": "📅",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "office"
            },
            {
                "description": "open file folder",
                "emoticon": "📂",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "office"
            },
            {
                "description": "file folder",
                "emoticon": "📁",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "office"
            },
            {
                "description": "briefcase",
                "emoticon": "💼",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "office"
            },
            {
                "description": "scissors",
                "emoticon": "✂️",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "office"
            }
        ],
        "lock": [
            {
                "description": "old key",
                "emoticon": "🗝️",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "lock"
            },
            {
                "description": "unlocked",
                "emoticon": "🔓",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "lock"
            },
            {
                "description": "locked",
                "emoticon": "🔒",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "lock"
            },
            {
                "description": "key",
                "emoticon": "🔑",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "lock"
            },
            {
                "description": "locked with key",
                "emoticon": "🔐",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "lock"
            },
            {
                "description": "locked with pen",
                "emoticon": "🔏",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "lock"
            }
        ],
        "tool": [
            {
                "description": "axe",
                "emoticon": "🪓",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "tool"
            },
            {
                "description": "magnet",
                "emoticon": "🧲",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "tool"
            },
            {
                "description": "toolbox",
                "emoticon": "🧰",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "tool"
            },
            {
                "description": "white cane",
                "emoticon": "🦯",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "tool"
            },
            {
                "description": "shield",
                "emoticon": "🛡️",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "tool"
            },
            {
                "description": "hammer and wrench",
                "emoticon": "🛠️",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "tool"
            },
            {
                "description": "dagger",
                "emoticon": "🗡️",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "tool"
            },
            {
                "description": "clamp",
                "emoticon": "🗜️",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "tool"
            },
            {
                "description": "nut and bolt",
                "emoticon": "🔩",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "tool"
            },
            {
                "description": "hammer",
                "emoticon": "🔨",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "tool"
            },
            {
                "description": "wrench",
                "emoticon": "🔧",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "tool"
            },
            {
                "description": "link",
                "emoticon": "🔗",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "tool"
            },
            {
                "description": "bomb",
                "emoticon": "💣",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "tool"
            },
            {
                "description": "bow and arrow",
                "emoticon": "🏹",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "tool"
            },
            {
                "description": "broken chain",
                "emoticon": "⛓️‍💥",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "tool"
            },
            {
                "description": "chains",
                "emoticon": "⛓️",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "tool"
            },
            {
                "description": "pick",
                "emoticon": "⛏️",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "tool"
            },
            {
                "description": "gear",
                "emoticon": "⚙️",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "tool"
            },
            {
                "description": "balance scale",
                "emoticon": "⚖️",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "tool"
            },
            {
                "description": "crossed swords",
                "emoticon": "⚔️",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "tool"
            },
            {
                "description": "hammer and pick",
                "emoticon": "⚒️",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "tool"
            }
        ],
        "science": [
            {
                "description": "dna",
                "emoticon": "🧬",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "science"
            },
            {
                "description": "petri dish",
                "emoticon": "🧫",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "science"
            },
            {
                "description": "test tube",
                "emoticon": "🧪",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "science"
            },
            {
                "description": "telescope",
                "emoticon": "🔭",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "science"
            },
            {
                "description": "microscope",
                "emoticon": "🔬",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "science"
            },
            {
                "description": "satellite antenna",
                "emoticon": "📡",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "science"
            },
            {
                "description": "alembic",
                "emoticon": "⚗️",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "science"
            }
        ],
        "medical": [
            {
                "description": "stethoscope",
                "emoticon": "🩺",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "medical"
            },
            {
                "description": "adhesive bandage",
                "emoticon": "🩹",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "medical"
            },
            {
                "description": "drop of blood",
                "emoticon": "🩸",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "medical"
            },
            {
                "description": "pill",
                "emoticon": "💊",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "medical"
            },
            {
                "description": "syringe",
                "emoticon": "💉",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "medical"
            }
        ],
        "household": [
            {
                "description": "razor",
                "emoticon": "🪒",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "household"
            },
            {
                "description": "chair",
                "emoticon": "🪑",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "household"
            },
            {
                "description": "sponge",
                "emoticon": "🧽",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "household"
            },
            {
                "description": "soap",
                "emoticon": "🧼",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "household"
            },
            {
                "description": "roll of paper",
                "emoticon": "🧻",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "household"
            },
            {
                "description": "basket",
                "emoticon": "🧺",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "household"
            },
            {
                "description": "broom",
                "emoticon": "🧹",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "household"
            },
            {
                "description": "safety pin",
                "emoticon": "🧷",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "household"
            },
            {
                "description": "lotion bottle",
                "emoticon": "🧴",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "household"
            },
            {
                "description": "fire extinguisher",
                "emoticon": "🧯",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "household"
            },
            {
                "description": "shopping cart",
                "emoticon": "🛒",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "household"
            },
            {
                "description": "bed",
                "emoticon": "🛏️",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "household"
            },
            {
                "description": "couch and lamp",
                "emoticon": "🛋️",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "household"
            },
            {
                "description": "bathtub",
                "emoticon": "🛁",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "household"
            },
            {
                "description": "shower",
                "emoticon": "🚿",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "household"
            },
            {
                "description": "toilet",
                "emoticon": "🚽",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "household"
            },
            {
                "description": "door",
                "emoticon": "🚪",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "household"
            }
        ],
        "other-object": [
            {
                "description": "nazar amulet",
                "emoticon": "🧿",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "other-object"
            },
            {
                "description": "cigarette",
                "emoticon": "🚬",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "other-object"
            },
            {
                "description": "moai",
                "emoticon": "🗿",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "other-object"
            },
            {
                "description": "funeral urn",
                "emoticon": "⚱️",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "other-object"
            },
            {
                "description": "coffin",
                "emoticon": "⚰️",
                "toneType": [],
                "groupTitle": "Objects",
                "subgroupTitle": "other-object"
            }
        ]
    },
    "Symbols": {
        "transport-sign": [
            {
                "description": "left luggage",
                "emoticon": "🛅",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "transport-sign"
            },
            {
                "description": "baggage claim",
                "emoticon": "🛄",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "transport-sign"
            },
            {
                "description": "customs",
                "emoticon": "🛃",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "transport-sign"
            },
            {
                "description": "passport control",
                "emoticon": "🛂",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "transport-sign"
            },
            {
                "description": "water closet",
                "emoticon": "🚾",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "transport-sign"
            },
            {
                "description": "baby symbol",
                "emoticon": "🚼",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "transport-sign"
            },
            {
                "description": "restroom",
                "emoticon": "🚻",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "transport-sign"
            },
            {
                "description": "women’s room",
                "emoticon": "🚺",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "transport-sign"
            },
            {
                "description": "men’s room",
                "emoticon": "🚹",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "transport-sign"
            },
            {
                "description": "potable water",
                "emoticon": "🚰",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "transport-sign"
            },
            {
                "description": "litter in bin sign",
                "emoticon": "🚮",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "transport-sign"
            },
            {
                "description": "ATM sign",
                "emoticon": "🏧",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "transport-sign"
            },
            {
                "description": "wheelchair symbol",
                "emoticon": "♿",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "transport-sign"
            }
        ],
        "warning": [
            {
                "description": "children crossing",
                "emoticon": "🚸",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "warning"
            },
            {
                "description": "no pedestrians",
                "emoticon": "🚷",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "warning"
            },
            {
                "description": "no bicycles",
                "emoticon": "🚳",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "warning"
            },
            {
                "description": "non-potable water",
                "emoticon": "🚱",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "warning"
            },
            {
                "description": "no littering",
                "emoticon": "🚯",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "warning"
            },
            {
                "description": "no smoking",
                "emoticon": "🚭",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "warning"
            },
            {
                "description": "prohibited",
                "emoticon": "🚫",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "warning"
            },
            {
                "description": "no one under eighteen",
                "emoticon": "🔞",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "warning"
            },
            {
                "description": "no mobile phones",
                "emoticon": "📵",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "warning"
            },
            {
                "description": "no entry",
                "emoticon": "⛔",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "warning"
            },
            {
                "description": "warning",
                "emoticon": "⚠️",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "warning"
            },
            {
                "description": "biohazard",
                "emoticon": "☣️",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "warning"
            },
            {
                "description": "radioactive",
                "emoticon": "☢️",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "warning"
            }
        ],
        "arrow": [
            {
                "description": "TOP arrow",
                "emoticon": "🔝",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "arrow"
            },
            {
                "description": "SOON arrow",
                "emoticon": "🔜",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "arrow"
            },
            {
                "description": "ON! arrow",
                "emoticon": "🔛",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "arrow"
            },
            {
                "description": "END arrow",
                "emoticon": "🔚",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "arrow"
            },
            {
                "description": "BACK arrow",
                "emoticon": "🔙",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "arrow"
            },
            {
                "description": "counterclockwise arrows button",
                "emoticon": "🔄",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "arrow"
            },
            {
                "description": "clockwise vertical arrows",
                "emoticon": "🔃",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "arrow"
            },
            {
                "description": "down arrow",
                "emoticon": "⬇️",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "arrow"
            },
            {
                "description": "up arrow",
                "emoticon": "⬆️",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "arrow"
            },
            {
                "description": "left arrow",
                "emoticon": "⬅️",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "arrow"
            },
            {
                "description": "right arrow curving down",
                "emoticon": "⤵️",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "arrow"
            },
            {
                "description": "right arrow curving up",
                "emoticon": "⤴️",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "arrow"
            },
            {
                "description": "right arrow",
                "emoticon": "➡️",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "arrow"
            },
            {
                "description": "left arrow curving right",
                "emoticon": "↪️",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "arrow"
            },
            {
                "description": "right arrow curving left",
                "emoticon": "↩️",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "arrow"
            },
            {
                "description": "down-left arrow",
                "emoticon": "↙️",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "arrow"
            },
            {
                "description": "down-right arrow",
                "emoticon": "↘️",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "arrow"
            },
            {
                "description": "up-right arrow",
                "emoticon": "↗️",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "arrow"
            },
            {
                "description": "up-left arrow",
                "emoticon": "↖️",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "arrow"
            },
            {
                "description": "up-down arrow",
                "emoticon": "↕️",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "arrow"
            },
            {
                "description": "left-right arrow",
                "emoticon": "↔️",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "arrow"
            }
        ],
        "religion": [
            {
                "description": "place of worship",
                "emoticon": "🛐",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "religion"
            },
            {
                "description": "menorah",
                "emoticon": "🕎",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "religion"
            },
            {
                "description": "om",
                "emoticon": "🕉️",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "religion"
            },
            {
                "description": "dotted six-pointed star",
                "emoticon": "🔯",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "religion"
            },
            {
                "description": "star of David",
                "emoticon": "✡️",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "religion"
            },
            {
                "description": "latin cross",
                "emoticon": "✝️",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "religion"
            },
            {
                "description": "atom symbol",
                "emoticon": "⚛️",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "religion"
            },
            {
                "description": "wheel of dharma",
                "emoticon": "☸️",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "religion"
            },
            {
                "description": "yin yang",
                "emoticon": "☯️",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "religion"
            },
            {
                "description": "peace symbol",
                "emoticon": "☮️",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "religion"
            },
            {
                "description": "star and crescent",
                "emoticon": "☪️",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "religion"
            },
            {
                "description": "orthodox cross",
                "emoticon": "☦️",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "religion"
            }
        ],
        "zodiac": [
            {
                "description": "Ophiuchus",
                "emoticon": "⛎",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "zodiac"
            },
            {
                "description": "Pisces",
                "emoticon": "♓",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "zodiac"
            },
            {
                "description": "Aquarius",
                "emoticon": "♒",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "zodiac"
            },
            {
                "description": "Capricorn",
                "emoticon": "♑",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "zodiac"
            },
            {
                "description": "Sagittarius",
                "emoticon": "♐",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "zodiac"
            },
            {
                "description": "Scorpio",
                "emoticon": "♏",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "zodiac"
            },
            {
                "description": "Libra",
                "emoticon": "♎",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "zodiac"
            },
            {
                "description": "Virgo",
                "emoticon": "♍",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "zodiac"
            },
            {
                "description": "Leo",
                "emoticon": "♌",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "zodiac"
            },
            {
                "description": "Cancer",
                "emoticon": "♋",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "zodiac"
            },
            {
                "description": "Gemini",
                "emoticon": "♊",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "zodiac"
            },
            {
                "description": "Taurus",
                "emoticon": "♉",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "zodiac"
            },
            {
                "description": "Aries",
                "emoticon": "♈",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "zodiac"
            }
        ],
        "av-symbol": [
            {
                "description": "downwards button",
                "emoticon": "🔽",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "av-symbol"
            },
            {
                "description": "upwards button",
                "emoticon": "🔼",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "av-symbol"
            },
            {
                "description": "bright button",
                "emoticon": "🔆",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "av-symbol"
            },
            {
                "description": "dim button",
                "emoticon": "🔅",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "av-symbol"
            },
            {
                "description": "repeat single button",
                "emoticon": "🔂",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "av-symbol"
            },
            {
                "description": "repeat button",
                "emoticon": "🔁",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "av-symbol"
            },
            {
                "description": "shuffle tracks button",
                "emoticon": "🔀",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "av-symbol"
            },
            {
                "description": "antenna bars",
                "emoticon": "📶",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "av-symbol"
            },
            {
                "description": "mobile phone off",
                "emoticon": "📴",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "av-symbol"
            },
            {
                "description": "vibration mode",
                "emoticon": "📳",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "av-symbol"
            },
            {
                "description": "cinema",
                "emoticon": "🎦",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "av-symbol"
            },
            {
                "description": "reverse button",
                "emoticon": "◀️",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "av-symbol"
            },
            {
                "description": "play button",
                "emoticon": "▶️",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "av-symbol"
            },
            {
                "description": "record button",
                "emoticon": "⏺️",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "av-symbol"
            },
            {
                "description": "stop button",
                "emoticon": "⏹️",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "av-symbol"
            },
            {
                "description": "pause button",
                "emoticon": "⏸️",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "av-symbol"
            },
            {
                "description": "play or pause button",
                "emoticon": "⏯️",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "av-symbol"
            },
            {
                "description": "last track button",
                "emoticon": "⏮️",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "av-symbol"
            },
            {
                "description": "next track button",
                "emoticon": "⏭️",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "av-symbol"
            },
            {
                "description": "fast down button",
                "emoticon": "⏬",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "av-symbol"
            },
            {
                "description": "fast up button",
                "emoticon": "⏫",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "av-symbol"
            },
            {
                "description": "fast reverse button",
                "emoticon": "⏪",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "av-symbol"
            },
            {
                "description": "fast-forward button",
                "emoticon": "⏩",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "av-symbol"
            },
            {
                "description": "eject button",
                "emoticon": "⏏️",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "av-symbol"
            }
        ],
        "gender": [
            {
                "description": "transgender symbol",
                "emoticon": "⚧️",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "gender"
            },
            {
                "description": "male sign",
                "emoticon": "♂️",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "gender"
            },
            {
                "description": "female sign",
                "emoticon": "♀️",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "gender"
            }
        ],
        "math": [
            {
                "description": "divide",
                "emoticon": "➗",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "math"
            },
            {
                "description": "minus",
                "emoticon": "➖",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "math"
            },
            {
                "description": "plus",
                "emoticon": "➕",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "math"
            },
            {
                "description": "multiply",
                "emoticon": "✖️",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "math"
            },
            {
                "description": "infinity",
                "emoticon": "♾️",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "math"
            }
        ],
        "punctuation": [
            {
                "description": "wavy dash",
                "emoticon": "〰️",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "punctuation"
            },
            {
                "description": "red exclamation mark",
                "emoticon": "❗",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "punctuation"
            },
            {
                "description": "white exclamation mark",
                "emoticon": "❕",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "punctuation"
            },
            {
                "description": "white question mark",
                "emoticon": "❔",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "punctuation"
            },
            {
                "description": "red question mark",
                "emoticon": "❓",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "punctuation"
            },
            {
                "description": "exclamation question mark",
                "emoticon": "⁉️",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "punctuation"
            },
            {
                "description": "double exclamation mark",
                "emoticon": "‼️",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "punctuation"
            }
        ],
        "currency": [
            {
                "description": "heavy dollar sign",
                "emoticon": "💲",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "currency"
            },
            {
                "description": "currency exchange",
                "emoticon": "💱",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "currency"
            }
        ],
        "other-symbol": [
            {
                "description": "trident emblem",
                "emoticon": "🔱",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "other-symbol"
            },
            {
                "description": "Japanese symbol for beginner",
                "emoticon": "🔰",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "other-symbol"
            },
            {
                "description": "name badge",
                "emoticon": "📛",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "other-symbol"
            },
            {
                "description": "part alternation mark",
                "emoticon": "〽️",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "other-symbol"
            },
            {
                "description": "hollow red circle",
                "emoticon": "⭕",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "other-symbol"
            },
            {
                "description": "double curly loop",
                "emoticon": "➿",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "other-symbol"
            },
            {
                "description": "curly loop",
                "emoticon": "➰",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "other-symbol"
            },
            {
                "description": "cross mark button",
                "emoticon": "❎",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "other-symbol"
            },
            {
                "description": "cross mark",
                "emoticon": "❌",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "other-symbol"
            },
            {
                "description": "sparkle",
                "emoticon": "❇️",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "other-symbol"
            },
            {
                "description": "eight-pointed star",
                "emoticon": "✴️",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "other-symbol"
            },
            {
                "description": "eight-spoked asterisk",
                "emoticon": "✳️",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "other-symbol"
            },
            {
                "description": "check mark",
                "emoticon": "✔️",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "other-symbol"
            },
            {
                "description": "check mark button",
                "emoticon": "✅",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "other-symbol"
            },
            {
                "description": "fleur-de-lis",
                "emoticon": "⚜️",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "other-symbol"
            },
            {
                "description": "medical symbol",
                "emoticon": "⚕️",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "other-symbol"
            },
            {
                "description": "recycling symbol",
                "emoticon": "♻️",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "other-symbol"
            },
            {
                "description": "check box with check",
                "emoticon": "☑️",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "other-symbol"
            },
            {
                "description": "trade mark",
                "emoticon": "™️",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "other-symbol"
            },
            {
                "description": "registered",
                "emoticon": "®️",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "other-symbol"
            },
            {
                "description": "copyright",
                "emoticon": "©️",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "other-symbol"
            }
        ],
        "keycap": [
            {
                "description": "keycap",
                "emoticon": "🔟",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "keycap"
            },
            {
                "description": "keycap",
                "emoticon": "9️⃣",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "keycap"
            },
            {
                "description": "keycap",
                "emoticon": "8️⃣",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "keycap"
            },
            {
                "description": "keycap",
                "emoticon": "7️⃣",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "keycap"
            },
            {
                "description": "keycap",
                "emoticon": "6️⃣",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "keycap"
            },
            {
                "description": "keycap",
                "emoticon": "5️⃣",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "keycap"
            },
            {
                "description": "keycap",
                "emoticon": "4️⃣",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "keycap"
            },
            {
                "description": "keycap",
                "emoticon": "3️⃣",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "keycap"
            },
            {
                "description": "keycap",
                "emoticon": "2️⃣",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "keycap"
            },
            {
                "description": "keycap",
                "emoticon": "1️⃣",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "keycap"
            },
            {
                "description": "keycap",
                "emoticon": "0️⃣",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "keycap"
            },
            {
                "description": "keycap",
                "emoticon": "*️⃣",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "keycap"
            }
        ],
        "alphanum": [
            {
                "description": "input latin letters",
                "emoticon": "🔤",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "alphanum"
            },
            {
                "description": "input symbols",
                "emoticon": "🔣",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "alphanum"
            },
            {
                "description": "input numbers",
                "emoticon": "🔢",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "alphanum"
            },
            {
                "description": "input latin lowercase",
                "emoticon": "🔡",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "alphanum"
            },
            {
                "description": "input latin uppercase",
                "emoticon": "🔠",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "alphanum"
            },
            {
                "description": "Japanese “acceptable” button",
                "emoticon": "🉑",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "alphanum"
            },
            {
                "description": "Japanese “bargain” button",
                "emoticon": "🉐",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "alphanum"
            },
            {
                "description": "Japanese “open for business” button",
                "emoticon": "🈺",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "alphanum"
            },
            {
                "description": "Japanese “discount” button",
                "emoticon": "🈹",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "alphanum"
            },
            {
                "description": "Japanese “application” button",
                "emoticon": "🈸",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "alphanum"
            },
            {
                "description": "Japanese “monthly amount” button",
                "emoticon": "🈷️",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "alphanum"
            },
            {
                "description": "Japanese “not free of charge” button",
                "emoticon": "🈶",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "alphanum"
            },
            {
                "description": "Japanese “no vacancy” button",
                "emoticon": "🈵",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "alphanum"
            },
            {
                "description": "Japanese “passing grade” button",
                "emoticon": "🈴",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "alphanum"
            },
            {
                "description": "Japanese “vacancy” button",
                "emoticon": "🈳",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "alphanum"
            },
            {
                "description": "Japanese “prohibited” button",
                "emoticon": "🈲",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "alphanum"
            },
            {
                "description": "Japanese “reserved” button",
                "emoticon": "🈯",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "alphanum"
            },
            {
                "description": "Japanese “free of charge” button",
                "emoticon": "🈚",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "alphanum"
            },
            {
                "description": "Japanese “service charge” button",
                "emoticon": "🈂️",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "alphanum"
            },
            {
                "description": "Japanese “here” button",
                "emoticon": "🈁",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "alphanum"
            },
            {
                "description": "VS button",
                "emoticon": "🆚",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "alphanum"
            },
            {
                "description": "UP! button",
                "emoticon": "🆙",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "alphanum"
            },
            {
                "description": "SOS button",
                "emoticon": "🆘",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "alphanum"
            },
            {
                "description": "OK button",
                "emoticon": "🆗",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "alphanum"
            },
            {
                "description": "NG button",
                "emoticon": "🆖",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "alphanum"
            },
            {
                "description": "NEW button",
                "emoticon": "🆕",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "alphanum"
            },
            {
                "description": "ID button",
                "emoticon": "🆔",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "alphanum"
            },
            {
                "description": "FREE button",
                "emoticon": "🆓",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "alphanum"
            },
            {
                "description": "COOL button",
                "emoticon": "🆒",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "alphanum"
            },
            {
                "description": "CL button",
                "emoticon": "🆑",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "alphanum"
            },
            {
                "description": "AB button (blood type)",
                "emoticon": "🆎",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "alphanum"
            },
            {
                "description": "P button",
                "emoticon": "🅿️",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "alphanum"
            },
            {
                "description": "O button (blood type)",
                "emoticon": "🅾️",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "alphanum"
            },
            {
                "description": "B button (blood type)",
                "emoticon": "🅱️",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "alphanum"
            },
            {
                "description": "A button (blood type)",
                "emoticon": "🅰️",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "alphanum"
            },
            {
                "description": "Japanese “secret” button",
                "emoticon": "㊙️",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "alphanum"
            },
            {
                "description": "Japanese “congratulations” button",
                "emoticon": "㊗️",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "alphanum"
            },
            {
                "description": "circled M",
                "emoticon": "Ⓜ️",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "alphanum"
            },
            {
                "description": "information",
                "emoticon": "ℹ️",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "alphanum"
            }
        ],
        "geometric": [
            {
                "description": "brown square",
                "emoticon": "🟫",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "geometric"
            },
            {
                "description": "purple square",
                "emoticon": "🟪",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "geometric"
            },
            {
                "description": "green square",
                "emoticon": "🟩",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "geometric"
            },
            {
                "description": "yellow square",
                "emoticon": "🟨",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "geometric"
            },
            {
                "description": "orange square",
                "emoticon": "🟧",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "geometric"
            },
            {
                "description": "blue square",
                "emoticon": "🟦",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "geometric"
            },
            {
                "description": "red square",
                "emoticon": "🟥",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "geometric"
            },
            {
                "description": "brown circle",
                "emoticon": "🟤",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "geometric"
            },
            {
                "description": "purple circle",
                "emoticon": "🟣",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "geometric"
            },
            {
                "description": "green circle",
                "emoticon": "🟢",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "geometric"
            },
            {
                "description": "yellow circle",
                "emoticon": "🟡",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "geometric"
            },
            {
                "description": "orange circle",
                "emoticon": "🟠",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "geometric"
            },
            {
                "description": "red triangle pointed down",
                "emoticon": "🔻",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "geometric"
            },
            {
                "description": "red triangle pointed up",
                "emoticon": "🔺",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "geometric"
            },
            {
                "description": "small blue diamond",
                "emoticon": "🔹",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "geometric"
            },
            {
                "description": "small orange diamond",
                "emoticon": "🔸",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "geometric"
            },
            {
                "description": "large blue diamond",
                "emoticon": "🔷",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "geometric"
            },
            {
                "description": "large orange diamond",
                "emoticon": "🔶",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "geometric"
            },
            {
                "description": "blue circle",
                "emoticon": "🔵",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "geometric"
            },
            {
                "description": "red circle",
                "emoticon": "🔴",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "geometric"
            },
            {
                "description": "white square button",
                "emoticon": "🔳",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "geometric"
            },
            {
                "description": "black square button",
                "emoticon": "🔲",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "geometric"
            },
            {
                "description": "radio button",
                "emoticon": "🔘",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "geometric"
            },
            {
                "description": "diamond with a dot",
                "emoticon": "💠",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "geometric"
            },
            {
                "description": "white large square",
                "emoticon": "⬜",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "geometric"
            },
            {
                "description": "black large square",
                "emoticon": "⬛",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "geometric"
            },
            {
                "description": "black circle",
                "emoticon": "⚫",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "geometric"
            },
            {
                "description": "white circle",
                "emoticon": "⚪",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "geometric"
            },
            {
                "description": "black medium-small square",
                "emoticon": "◾",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "geometric"
            },
            {
                "description": "white medium-small square",
                "emoticon": "◽",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "geometric"
            },
            {
                "description": "black medium square",
                "emoticon": "◼️",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "geometric"
            },
            {
                "description": "white medium square",
                "emoticon": "◻️",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "geometric"
            },
            {
                "description": "white small square",
                "emoticon": "▫️",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "geometric"
            },
            {
                "description": "black small square",
                "emoticon": "▪️",
                "toneType": [],
                "groupTitle": "Symbols",
                "subgroupTitle": "geometric"
            }
        ]
    },
    "Flags": {
        "flag": [
            {
                "description": "triangular flag",
                "emoticon": "🚩",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "flag"
            },
            {
                "description": "black flag",
                "emoticon": "🏴",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "flag"
            },
            {
                "description": "pirate flag",
                "emoticon": "🏴‍☠️",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "flag"
            },
            {
                "description": "white flag",
                "emoticon": "🏳️",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "flag"
            },
            {
                "description": "rainbow flag",
                "emoticon": "🏳️‍🌈",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "flag"
            },
            {
                "description": "transgender flag",
                "emoticon": "🏳️‍⚧️",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "flag"
            },
            {
                "description": "chequered flag",
                "emoticon": "🏁",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "flag"
            },
            {
                "description": "crossed flags",
                "emoticon": "🎌",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "flag"
            }
        ],
        "country-flag": [
            {
                "description": "flag",
                "emoticon": "🇿🇦",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇿🇲",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇿🇼",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇾🇪",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇾🇹",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇽🇰",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇼🇫",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇼🇸",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇻🇦",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇻🇨",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇻🇪",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇻🇬",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇻🇮",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇻🇳",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇻🇺",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇺🇦",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇺🇬",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇺🇲",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇺🇳",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇺🇸",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇺🇾",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇺🇿",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇹🇦",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇹🇨",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇹🇩",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇹🇫",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇹🇬",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇹🇭",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇹🇯",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇹🇰",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇹🇱",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇹🇲",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇹🇳",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇹🇴",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇹🇷",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇹🇹",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇹🇻",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇹🇼",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇹🇿",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇸🇦",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇸🇧",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇸🇨",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇸🇩",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇸🇪",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇸🇬",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇸🇭",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇸🇮",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇸🇯",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇸🇰",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇸🇱",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇸🇲",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇸🇳",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇸🇴",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇸🇷",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇸🇸",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇸🇹",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇸🇻",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇸🇽",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇸🇾",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇸🇿",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇷🇪",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇷🇴",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇷🇸",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇷🇺",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇷🇼",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇶🇦",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇵🇦",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇵🇪",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇵🇫",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇵🇬",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇵🇭",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇵🇰",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇵🇱",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇵🇲",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇵🇳",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇵🇷",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇵🇸",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇵🇹",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇵🇼",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇵🇾",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇴🇲",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇳🇦",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇳🇨",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇳🇪",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇳🇫",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇳🇬",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇳🇮",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇳🇱",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇳🇴",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇳🇵",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇳🇷",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇳🇺",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇳🇿",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇲🇦",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇲🇨",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇲🇩",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇲🇪",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇲🇫",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇲🇬",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇲🇭",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇲🇰",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇲🇱",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇲🇲",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇲🇳",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇲🇴",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇲🇵",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇲🇶",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇲🇷",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇲🇸",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇲🇹",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇲🇺",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇲🇻",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇲🇼",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇲🇽",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇲🇾",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇲🇿",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇱🇦",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇱🇧",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇱🇨",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇱🇮",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇱🇰",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇱🇷",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇱🇸",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇱🇹",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇱🇺",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇱🇻",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇱🇾",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇰🇪",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇰🇬",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇰🇭",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇰🇮",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇰🇲",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇰🇳",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇰🇵",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇰🇷",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇰🇼",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇰🇾",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇰🇿",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇯🇪",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇯🇲",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇯🇴",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇯🇵",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇮🇨",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇮🇩",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇮🇪",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇮🇱",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇮🇲",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇮🇳",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇮🇴",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇮🇶",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇮🇷",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇮🇸",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇮🇹",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇭🇰",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇭🇲",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇭🇳",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇭🇷",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇭🇹",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇭🇺",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇬🇦",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇬🇧",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇬🇩",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇬🇪",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇬🇫",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇬🇬",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇬🇭",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇬🇮",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇬🇱",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇬🇲",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇬🇳",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇬🇵",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇬🇶",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇬🇷",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇬🇸",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇬🇹",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇬🇺",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇬🇼",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇬🇾",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇫🇮",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇫🇯",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇫🇰",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇫🇲",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇫🇴",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇫🇷",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇪🇦",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇪🇨",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇪🇪",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇪🇬",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇪🇭",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇪🇷",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇪🇸",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇪🇹",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇪🇺",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇩🇪",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇩🇬",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇩🇯",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇩🇰",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇩🇲",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇩🇴",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇩🇿",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇨🇦",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇨🇨",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇨🇩",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇨🇫",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇨🇬",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇨🇭",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇨🇮",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇨🇰",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇨🇱",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇨🇲",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇨🇳",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇨🇴",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇨🇵",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇨🇷",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇨🇺",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇨🇻",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇨🇼",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇨🇽",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇨🇾",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇨🇿",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇧🇦",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇧🇧",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇧🇩",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇧🇪",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇧🇫",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇧🇬",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇧🇭",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇧🇮",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇧🇯",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇧🇱",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇧🇲",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇧🇳",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇧🇴",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇧🇶",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇧🇷",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇧🇸",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇧🇹",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇧🇻",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇧🇼",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇧🇾",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇧🇿",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇦🇨",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇦🇩",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇦🇪",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇦🇫",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇦🇬",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇦🇮",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇦🇱",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇦🇲",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇦🇴",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇦🇶",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇦🇷",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇦🇸",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇦🇹",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇦🇺",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇦🇼",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇦🇽",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            },
            {
                "description": "flag",
                "emoticon": "🇦🇿",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "country-flag"
            }
        ],
        "subdivision-flag": [
            {
                "description": "flag",
                "emoticon": "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "subdivision-flag"
            },
            {
                "description": "flag",
                "emoticon": "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "subdivision-flag"
            },
            {
                "description": "flag",
                "emoticon": "🏴󠁧󠁢󠁷󠁬󠁳󠁿",
                "toneType": [],
                "groupTitle": "Flags",
                "subgroupTitle": "subdivision-flag"
            }
        ]
    }
}