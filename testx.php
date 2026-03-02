<?php

$token = "8295267629:AAEFdQ1jqxDG2sj7xjvgn0hx3OGZdySP4-w";
$apiURL = "https://api.telegram.org/bot$token/";

$update = json_decode(file_get_contents("php://input"), true);

if(isset($update["message"])) {
    $chat_id = $update["message"]["chat"]["id"];
    $text = $update["message"]["text"];

    if($text == "/start") {
        sendMessage($chat_id, "اهلا وسهلا");
    }
}

function sendMessage($chat_id, $message) {
    global $apiURL;

    $data = [
        "chat_id" => $chat_id,
        "text" => $message
    ];

    file_get_contents($apiURL . "sendMessage?" . http_build_query($data));
}
?>