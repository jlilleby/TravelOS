<?php
require_once __DIR__ . '/bootstrap.php'; require_auth(); $pdo=db();
if(method()==='GET'){ $tripId=int_param('trip_id'); if(!$tripId)json_response(['error'=>'Missing trip_id'],400); $s=$pdo->prepare('SELECT * FROM budget_items WHERE trip_id=? ORDER BY id DESC');$s->execute([$tripId]);json_response($s->fetchAll()); }
if(method()==='POST'){ $d=input_json(); $s=$pdo->prepare('INSERT INTO budget_items (trip_id,category,item_name,amount,currency,paid) VALUES (?,?,?,?,?,?)');$s->execute([(int)($d['trip_id']??0),clean_string($d['category']??null,100),clean_string($d['item_name']??null,255)?:'Item',(float)($d['amount']??0),clean_string($d['currency']??'NOK',10)?:'NOK',!empty($d['paid'])?1:0]);json_response(['id'=>(int)$pdo->lastInsertId()],201); }
if(method()==='DELETE'){ $id=int_param('id'); if(!$id)json_response(['error'=>'Missing id'],400);$s=$pdo->prepare('DELETE FROM budget_items WHERE id=?');$s->execute([$id]);json_response(['ok'=>true]); }
json_response(['error'=>'Method not allowed'],405);
