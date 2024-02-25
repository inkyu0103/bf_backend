# 최신 버전의 Node.js를 기본 이미지로 사용
FROM node:latest

# 앱 디렉토리 생성 및 설정
WORKDIR /usr/src/app

# 앱 종속성 설치
COPY package*.json ./
RUN npm install

# 앱 소스 복사
COPY . .

# 포트 노출
EXPOSE 8000

# 앱 실행
CMD ["node", "index.js"]