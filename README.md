postman: 호출파일
maplebackend.postman_collection.json 파일 import 가능

|---maplebackend
  |-app
    |-Dockerfile
    |-...
  |-docker-compose.yml
  |-maplebackend.postman_collection.json

mongodb : localhost 
  - port 27017

nestjs : localhost
  - port 3000

도커컴포스 실행 : docker-compose up -d
mongodb, nestjs 같이 실행

-회원가입
{
  "username": "testuser04",
  "password": "123456",
  "role": "admin"
}

-로그인
{
  "username": "testadmin",
  "password": "123456"
}
로그인 시 access_token 토큰 발행

-회원가입확인
Authorization-bearer Token : access_token
해당 유저아이디 확인가능


아래부터 필수 : Authorization-bearer Token : access_token

-이벤트신규등록
{
  "username":"testadmin",
  "eventname": "사탕이벤트4",
  "valueSuccess": "10" //해당 성공미션값
}

-이벤트조회
{
    "username":"testuser04"
}

-이벤트신규보상등록
{
    "username": "testuser1",
    "eventname": "사탕이벤트3",
    "compensation": [
        {   
            "name":"사탕",
            "quantity":"10" //보상개수
        },
        {
            "name":"콜라",
            "quantity":"10" //보상개수
        }]
}

-사용자이벤트참여
{
    "username":"testuser01",
    "mission":[{
        "missionname":"사탕이벤트1",
        "missionstatus":"false", //미션성공해서 받으면 true, 안받았으면 false
        "valueStatus":"0", //현재 미션 성공값
        "misssioncondition":"해당 몬스터 5마리 퇴치"
    }]
}

-사용자미션보상요청
{
    "username":"testuser01",
    "eventname":"사탕이벤트1", //해당 미션 존재 여부 체크 
    "valueStatus":"10" // 해당 미션 개수체크
}