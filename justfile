set dotenv-load
set windows-shell := ["pwsh.exe", "-NoLogo", "-Command"]

build:
	docker build -t fortuna-gpt .

run:
	export $(cat .env | xargs)
	docker stop fortuna-gpt || true && docker rm fortuna-gpt || true
	docker run --name fortuna-gpt --rm -e OPENAI_API_KEY=${OPENAI_API_KEY} -p 3000:3000 fortuna-gpt

logs:
	docker logs -f fortuna-gpt
