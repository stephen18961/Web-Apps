<?php
// Connect to MySQL server
$conn = mysqli_connect("localhost", "root", "", "battleship");

// Check if connection was successful
if (!$conn) {
    die("Connection failed: " . mysqli_connect_error());
}

// Decode JSON string
$jsonString = $_GET['result'];
$data = json_decode(urldecode($jsonString), true);

if ($data) {
    // Loop through each item in the JSON array
    foreach ($data as $item) {
        // Access the values using array keys
        $name = mysqli_real_escape_string($conn, $item['name']);
        $totalScore = (int) $item['total_score'];
        $setsWon = (int) $item['setsWon'];
        $shipsSunk = (int) $item['shipsSunk'];

        // Check if name already exists in leaderboard table
        $result = mysqli_query($conn, "SELECT * FROM leaderboard WHERE name='$name'");

        if (mysqli_num_rows($result) > 0) {
            // Update existing row with new values
            $row = mysqli_fetch_assoc($result);
            $id = $row['id'];
            $totalScore += (int) $row['total_score'];
            $setsWon += (int) $row['sets_won'];
            $shipsSunk += (int) $row['ships_sunk'];

            mysqli_query($conn, "UPDATE leaderboard SET total_score=$totalScore, sets_won=$setsWon, ships_sunk=$shipsSunk WHERE id=$id");
        } else {
            // Insert new row with values
            mysqli_query($conn, "INSERT INTO leaderboard (name, total_score, sets_won, ships_sunk) VALUES ('$name', $totalScore, $setsWon, $shipsSunk)");
        }
    }

    // Close MySQL connection
    mysqli_close($conn);
}
?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>

<body>
    <?php
    // Decode JSON string
    $jsonString = $_GET['result'];
    $data = json_decode(urldecode($jsonString), true);

    // Check if decoding was successful
    if ($data) {
        // Loop through each item in the JSON array
        foreach ($data as $item) {
            // Access the values using array keys
            $name = $item['name'];
            $guesses = $item['guesses'];
            $score = $item['score'];
            $totalScore = $item['total_score'];
            $setsWon = $item['setsWon'];
            $shipsSunk = $item['shipsSunk'];
            $ammo = $item['ammo'];

            // Display the values on HTML
            echo "Name: $name<br>";
            echo "Guesses: $guesses<br>";
            echo "Score: $score<br>";
            echo "Total Score: $totalScore<br>";
            echo "Sets Won: $setsWon<br>";
            echo "Ships Sunk: $shipsSunk<br>";
            echo "Ammo: $ammo<br>";
            echo "<br><br>";
        }
        echo "Data has been saved.";
    } else {
        // Handle JSON decoding error
        echo "Error decoding JSON string.";
    }

    ?>
</body>

</html>