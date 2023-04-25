<?php

// Connect to the database
$conn = new mysqli("localhost", "root", "", "battleship");

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Leaderboard</title>
    <link rel="stylesheet" href="css/leaderboard.css">
</head>

<body>
    <h1>Stephen's Battleship <br>Hall of Fame</h1>
    <a href="battleship.html">
        <h1>Play Game</h1>
    </a>
    <h2>To filter, click the column headers.</h2>
    <?php
    // Determine the order based on URL parameter, default to total_score if not set
    $order = isset($_GET['order']) ? $_GET['order'] : 'total_score';
    $allowed_orders = ['total_score', 'sets_won', 'ships_sunk'];
    if (!in_array($order, $allowed_orders)) {
        $order = 'total_score';
    }

    // Select all data from the table, ordered by the selected column
    $sql = "SELECT * FROM leaderboard ORDER BY $order DESC";
    $result = $conn->query($sql);

    // Check if there are any results
    if ($result->num_rows > 0) {

        // Start building the table HTML
        echo "<table>";
        echo "<tr><th>Name</th><th><a href=\"?order=total_score\">Total Score</a></th><th><a href=\"?order=sets_won\">Sets Won</a></th><th><a href=\"?order=ships_sunk\">Ships Sunk</a></th></tr>";

        // Loop through each row and display the data
        while ($row = $result->fetch_assoc()) {
            echo "<tr>";
            echo "<td>" . $row['name'] . "</td>";
            echo "<td>" . $row['total_score'] . "</td>";
            echo "<td>" . $row['sets_won'] . "</td>";
            echo "<td>" . $row['ships_sunk'] . "</td>";
            echo "</tr>";
        }

        // End the table HTML
        echo "</table>";
    } else {
        echo "No results found.";
    }

    // Close the database connection
    $conn->close();
    ?>
</body>

</html>