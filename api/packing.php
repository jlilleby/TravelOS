<?php
require_once __DIR__ . '/bootstrap.php'; require_auth(); $pdo=db();
if(method()==='GET'){ $tripId=int_param('trip_id'); if(!$tripId)json_response(['error'=>'Missing trip_id'],400); $s=$pdo->prepare('SELECT id,trip_id,item_text,place,packed,category FROM packing_items WHERE trip_id=? ORDER BY packed ASC,id DESC');$s->execute([$tripId]);json_response($s->fetchAll()); }
if(method()==='POST'){ $d=input_json(); $s=$pdo->prepare('INSERT INTO packing_items (trip_id,item_text,place,packed,category) VALUES (?,?,?,?,?)');$s->execute([(int)($d['trip_id']??0),clean_string($d['item_text']??null,255)?:'Item',clean_string($d['place']??null,255),!empty($d['packed'])?1:0,clean_string($d['category']??null,100)]);json_response(['id'=>(int)$pdo->lastInsertId()],201); }
if(method()==='PUT'){ $d=input_json(); $s=$pdo->prepare('UPDATE packing_items SET item_text=?,place=?,packed=?,category=? WHERE id=?');$s->execute([clean_string($d['item_text']??null,255)?:'Item',clean_string($d['place']??null,255),!empty($d['packed'])?1:0,clean_string($d['category']??null,100),(int)($d['id']??0)]);json_response(['ok'=>true]); }
if(method()==='DELETE'){ $id=int_param('id'); if(!$id)json_response(['error'=>'Missing id'],400);$s=$pdo->prepare('DELETE FROM packing_items WHERE id=?');$s->execute([$id]);json_response(['ok'=>true]); }
json_response(['error'=>'Method not allowed'],405);
