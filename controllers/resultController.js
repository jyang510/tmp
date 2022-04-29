require('dotenv').config();
const axios = require('axios');

const apiUrl = process.env.API_URL;

module.exports = {
    GetResult: async (_, res) => {
        // 과제 1번 사항에 기재된 API를 요청해 데이터 수집

        //totalPage.total_page가 총 페이지 수의 넘버값
        const totalPage = await axios.get(`${apiUrl}/totalPage`, { headers: { 'Content-Type': 'application/json' }}
            ).then((data) => { return data.data; }
            ).catch((error) => { return error; });

        // brand하고 category API에 일단 요청해서 정보를 받아온다. 
        // 둘 다 배열안에 객체가 요소로 들어가있다.
        // ex) 코드가 20인 브랜드의 name값 === brand[20 - 1].name
        const brand = await axios.get(`${apiUrl}/brands`, { headers: { 'Content-Type': 'application/json' }}
        ).then((data) => { return data.data; }
        ).catch((error) => { return error; });

        const category = await axios.get(`${apiUrl}/categories`, { headers: { 'Content-Type': 'application/json' }}
            ).then((data) => { return data.data; }
            ).catch((error) => { return error; });

        // 2-1 과제인 구조통합을 위한 totallist.
        let totalList = [];
        // 2-1, 2-2 전부 이 반복문 안에서 끝낸다.
        for (let i = 1; i < totalPage.total_page; i++) {

            // page별 list 정보를 받아온다.
            let list = await axios.get(`${apiUrl}/list?page=${i}`, { headers: { 'Content-Type': 'application/json' }}
            ).then((data) => { return data.data; }
            ).catch((error) => { return error; });
            // list의 요소가 type 키의 value값에 따라 다른 key값들이 다르게 적혀 있어서 경우의 수를 나눠야한다.
            for (let j = 0; j < list.length; j++) {
                let processedInfo = {};
                switch(list[j]['type']) {
                    case 'A':
                        processedInfo['brand_code'] = list[j]['MARCA_CODICE'];
                        processedInfo['category_code'] = list[j]['CATEGORIA_CODICE'];
                        processedInfo['color'] = list[j]['COLORE'];
                        processedInfo['gender'] = list[j]['GENERE'];
                        processedInfo['season'] = list[j]['STAGIONE'];
                        break;
                    case 'B':
                        processedInfo['brand_code'] = list[j]['BRAND_CODE'];
                        processedInfo['category_code'] = list[j]['CATEGORY_CODE'];
                        processedInfo['color'] = list[j]['COLOR'];
                        processedInfo['gender'] = list[j]['GENDER'];
                        processedInfo['season'] = list[j]['SEASON'];
                        break;
                    case 'C':
                        processedInfo = list[j];
                        delete processedInfo['type'];
                        break;
                }
                // 2-1 브랜드, 카테고리 매칭 작업. brand_name, category_name을 합쳐준다
                processedInfo['brand_name'] = brand[Number(processedInfo['brand_code']) - 1]['name'];
                processedInfo['category_name'] = category[Number(processedInfo['category_code']) - 1]['name'];
                // 2-2 성별, 시즌 가공 작업. if문을 통해 값을 통일 시킨다.
                let gender = processedInfo['gender'];
                if (gender === 'woman' || gender === 'donna' || gender === 'women') {
                    processedInfo['gender'] = 'WOMEN';
                } else if (gender === 'men' || gender === 'man') {
                    processedInfo['gender'] = 'MEN';
                } else {
                    processedInfo['gender'] = 'UNISEX'; 
                }
                // 시즌이 ss, fw말고 없으므로 확인 절차가 간단하다.
                let season = processedInfo['season']
                if (season.length === 4) {
                    // 숫자+영어 4글자인 경우
                    season = season.toUpperCase();
                    processedInfo['season'] = `${season[2] + season[3] + season[0] + season[1]}`;
                } else {
                    // 숫자 + 영어가 긴 경우, 첫 알파벳을 보고 ss인지 fw인지 확인한다
                    if (season[3] === 's') {
                        processedInfo['season'] = `SS${season[0] + season[1]}`;
                    } else if (season[3] === 'f') {
                        processedInfo['season'] = `FW${season[0] + season[1]}`;
                    }
                }
                // 마지막으로 name을 넣어주고 totalList 배열에 저장한다
                processedInfo['name'] = `${processedInfo['brand_name']} ${processedInfo['color']} ${processedInfo['category_name']}`;
                totalList.push(processedInfo);
            }
        }
        // 전달 성공
        res.status(200).send(totalList);
    },
}