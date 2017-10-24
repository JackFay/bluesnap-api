import mysql from "mysql";

export default callback => {
	var connection = mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'root',
      database: 'batch_uploader',
			port: 3306
    })

    connection.connect(function(err) {
      if (err) {
        console.error('error connecting: ' + err.stack);
        return;
      }

      console.log('connected as id ' + connection.threadId);
    });


	// connect to a database if needed, then pass it to `callback`:
	callback(connection);
}
