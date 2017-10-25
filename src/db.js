import mysql from "mysql";
import config from './config';

export default callback => {
	var pool = mysql.createPool({
			connectionLimit: 10,
      host: 'localhost',
      user: config.database_user,
      password: config.database_password,
      database: config.database,
			port: 3306,
			waitForConnections : true,
      queueLimit :0,
			debug    :  true,
      wait_timeout : 28800,
      connect_timeout :10
    });

		pool.getConnection(function(err, connection){
			if (err) {
        console.error('error connecting: ' + err.stack);
        return;
      }

      console.log('connected as id ' + connection.threadId);
		});


	// connect to a database if needed, then pass it to `callback`:
	callback(pool);
}
