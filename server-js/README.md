## test commands
curl -s -XPOST -H 'Content-Type: application/json' -d '{"email": "k.schmeets@gmail.com", "password": "test"}' http://js.flippermaps.dev/api/users | jq -r .id | read userId
curl -s -XPOST -H 'Content-Type: application/json' -d '{"name": "IRON MAN", "links": {"users": "'"$userId"'"}}' http://js.flippermaps.dev/api/machines | jq -r .id | read machineId
curl -s -XPOST -H 'Content-Type: application/json' -d '{"name": "Frenken", "pin": {"type": "Point", "coordinates": [50, 5]}, "links": {"machines": ["'"$machineId"'"], "users": "'"$userId"'"}}' http://js.flippermaps.dev/api/locations | jq -r .id | read locationId
curl -s -XPOST -H 'Content-Type: application/json' -d '{"name": "Andere kast", "links": {"locations": "'"$locationId"'", "users": "'"$userId"'"}}' http://js.flippermaps.dev/api/machines

## stored procedures
CREATE FUNCTION notify_change_trigger() RETURNS trigger AS $$
DECLARE
BEGIN
  PERFORM pg_notify('watchers', 'change:' || TG_TABLE_NAME || ':' || NEW.id);
  RETURN new;
END;
$$ LANGUAGE plpgsql;

CREATE FUNCTION notify_destroy_trigger() RETURNS trigger AS $$
DECLARE
BEGIN
  PERFORM pg_notify('watchers', 'destroy:' || TG_TABLE_NAME || ':' || NEW.id);
  RETURN new;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_insert_on_users AFTER INSERT ON users FOR EACH ROW EXECUTE PROCEDURE notify_change_trigger();
CREATE TRIGGER after_update_on_users AFTER UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE notify_change_trigger();
CREATE TRIGGER after_destroy_on_users AFTER DELETE ON users FOR EACH ROW EXECUTE PROCEDURE notify_destroy_trigger();

CREATE TRIGGER after_insert_on_machines AFTER INSERT ON machines FOR EACH ROW EXECUTE PROCEDURE notify_change_trigger();
CREATE TRIGGER after_update_on_machines AFTER UPDATE ON machines FOR EACH ROW EXECUTE PROCEDURE notify_change_trigger();
CREATE TRIGGER after_destroy_on_machines AFTER DELETE ON machines FOR EACH ROW EXECUTE PROCEDURE notify_destroy_trigger();

CREATE TRIGGER after_insert_on_locations AFTER INSERT ON locations FOR EACH ROW EXECUTE PROCEDURE notify_change_trigger();
CREATE TRIGGER after_update_on_locations AFTER UPDATE ON locations FOR EACH ROW EXECUTE PROCEDURE notify_change_trigger();
CREATE TRIGGER after_destroy_on_locations AFTER DELETE ON locations FOR EACH ROW EXECUTE PROCEDURE notify_destroy_trigger();
