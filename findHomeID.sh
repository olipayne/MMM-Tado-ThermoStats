USERNAME=you@email.com
PASSWORD=yourPassword
curl --silent "https://my.tado.com/mobile/1.9/getCurrentState?username="$USERNAME"&password="$PASSWORD"" > homeid
homeId=$(grep -o "homeId.*" homeid| awk '{print substr($1,9,4)}')
echo "$homeId"
rm homeid
