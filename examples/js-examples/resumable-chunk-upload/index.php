<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">
        <title>Document</title>
        <link rel="stylesheet" href="assets/css/bootstrap.min.css">
        <link rel="stylesheet" href="assets/css/font-awesome.min.css">
        <link rel="stylesheet" href="assets/css/main.css">
        <script src="assets/js/jquery-3.2.1.min.js"></script>
        <script src="assets/js/propper.min.js"></script>
        <script src="assets/js/bootstrap.min.js"></script>
    </head>
    <body>

        <div class="container-fluid">
            <div class="row">
                <div class="col-sm-12 text-right">
                    <label class="custom-file margin-10">
                        <span class="custom-file-control text-left"></span>
                        <input name="file[]" id="file" class="custom-file-input" multiple="" type="file">
                    </label>
                </div>
            </div>
            <div class="row">
                <div class="col-sm-12">
                    <table id="uploadTable" class="table table-striped table-responsive-sm">
                        <thead>
                            <tr>
                                <th class="text-left" scope="col">#</th>
                                <th class="text-left" scope="col">name</th>
                                <th class="text-center" scope="col">status</th>
                                <th class="text-center" scope="col">controls</th>
                            </tr>
                        </thead>
                        <tbody>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        <script src="assets/js/main.js"></script>

    </body>
</html>