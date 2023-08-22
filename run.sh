git pull

cd ./frontend
yarn install
yarn build
cd ..

docker-compose -d up --build