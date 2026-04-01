<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Datos desde Google Sheets</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 40px; background-color: #f0f2f5; }
        .container { background: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        table { border-collapse: collapse; width: 100%; margin-top: 20px; }
        th, td { padding: 12px 15px; border-bottom: 1px solid #ddd; text-align: left; }
        th { background-color: #34a853; color: white; text-transform: uppercase; font-size: 14px; }
        tr:hover { background-color: #f9f9f9; }
    </style>
</head>
<body>

<div class="container">
    <h2>Hoja de Cálculo en Tiempo Real</h2>

    <?php
    // PEGA AQUÍ TU ENLACE DE PUBLICACIÓN DE GOOGLE SHEETS
    $googleSheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSeSsEyntLGNGJU-uq7V4aFrP0QIYFTaBZ-hXeeAXsmlW6hEFhaA5aDC_dyX23anFasD_iLN1nj_FWN/pub?gid=991812807&single=true&output=csv';

    if (($gestor = fopen($googleSheetUrl, "r")) !== FALSE) {
        echo "<table>";
        $fila_count = 0;

        while (($datos = fgetcsv($gestor, 1000, ",")) !== FALSE) {
            echo "<tr>";
            foreach ($datos as $columna) {
                if ($fila_count == 0) {
                    echo "<th>" . htmlspecialchars($columna) . "</th>";
                } else {
                    echo "<td>" . htmlspecialchars($columna) . "</td>";
                }
            }
            echo "</tr>";
            $fila_count++;
        }
        echo "</table>";
        fclose($gestor);
    } else {
        echo "<p>No se pudo conectar con la hoja de Google. Revisa el enlace y los permisos de publicación.</p>";
    }
    ?>
</div>

</body>
</html>