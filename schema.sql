CREATE TABLE csv_uploads (
  id INT AUTO_INCREMENT PRIMARY KEY,
  batch_id VARCHAR(255),
  date_time DATETIME,
  csv_path VARCHAR(255),
  response_code VARCHAR(100),
  response_message VARCHAR(255),
  response_body VARCHAR(255)
);

CREATE TABLE processed_transactions (
  id INT NOT NULL AUTO_INCREMENT,
  batch_id VARCHAR(255),
  vaulted_shopper_id VARCHAR(255),
  card_transaction_type VARCHAR(255),
  merchant_transaction_id VARCHAR(255),
  transaction_id VARCHAR(255),
  recurring_transaction VARCHAR(255),
  amount DECIMAL(13, 4),
  currency VARCHAR(255),
  card_holder_first_name VARCHAR(255),
  card_holder_last_name VARCHAR(255),
  card_last_four_digits INT,
  card_expiration_month INT,
  card_expiration_year INT,
  card_type VARCHAR(255),
  processing_status VARCHAR(255),
  processing_error_code VARCHAR(255),
  processing_error_description VARCHAR(255),
  batch_processing_status VARCHAR(255),
  PRIMARY KEY (`id`)
);
