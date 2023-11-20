`1F471 1F3FB  ; fully-qualified     # 👱🏻 E1.0 person: light skin tone, blond hair`

document.body.textContent.substring(document.body.textContent.indexOf('# group:')).split('# group:').filter(e=>e.trim() != '').reduce((groupTotal,groupText)=>{
    let subgroupList = groupText.split('# subgroup:');
    let groupTitle = subgroupList.shift().replaceAll('\n', '').trim();
    
    let subgroupObj = subgroupList.reduce((subgroupTotal, subgroupText) => {
        let subgroupItemList = subgroupText.split('\n').filter(e=>{
            let firstChar = e.trim().charAt(0); 
            return firstChar != '#' && firstChar != ''
        });
        let subgroupTitle = subgroupItemList.shift().replaceAll('\n', '').trim();
        subgroupTotal[subgroupTitle] = subgroupItemList.map(str=>{
            let splitCode = str.split(';')
            let code = splitCode[0].trim().split(' ')
            let qualifiedAndDescription = splitCode[1].split('#')
            let qualified = qualifiedAndDescription[0].trim();
            let descriptionList = qualifiedAndDescription[1].split(' ').filter(e=>e!='');
            let emoji = descriptionList[0]
            let description = descriptionList.splice(2).join(' ');
            let type = description.split(':')[1]?.split(',').map(e=>e.trim());
            if(! type || type.length == 0){
                return {code, qualified, description, emoji};    
            }
            let toneType = type.filter(e=> e.includes('skin tone'))
            type = type.filter(e=> ! e.includes('skin tone'));
            
            return {code, qualified, description, emoji, type, toneType};
        }).filter(({qualified}) => qualified == 'fully-qualified')
        return subgroupTotal;
    }, {});

    groupTotal[groupTitle] = subgroupObj; 
    
    return groupTotal;
}, {})