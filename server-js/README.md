curl -s -XPOST -H 'Content-Type: application/json' -d '{"email": "k.schmeets@gmail.com", "password": "test"}' http://js.flippermaps.dev/api/users | jq -r .id | read userId
curl -s -XPOST -H 'Content-Type: application/json' -d '{"name": "IRON MAN"}' http://js.flippermaps.dev/api/machines | jq -r .id | read machineId
curl -s -XPOST -H 'Content-Type: application/json' -d '{"name": "Frenken", "pin": {"type": "Point", "coordinates": [50, 5]}, "links": {"machines": ["'"$machineId"'"], "users": "'"$userId"'"}}' http://js.flippermaps.dev/api/locations | jq -r .id | read locationId
curl -s -XPOST -H 'Content-Type: application/json' -d '{"name": "Andere kast", "links": {"locations": ["'"$locationId"'"]}}' http://js.flippermaps.dev/api/machines
