/** --  UPDATE CHANGE VERSION ---------------------------------------------------------------- */
DELIMITER $$

SET GLOBAL log_bin_trust_function_creators = 1;

CREATE TRIGGER `trg_global_settings_insert_uuid`
BEFORE INSERT ON `Global_Settings`
FOR EACH ROW
BEGIN
  IF NEW.change_version IS NULL OR NEW.change_version = '' THEN
    SET NEW.change_version = UUID();
  END IF;
END$$

CREATE TRIGGER `trg_global_settings_update_uuid`
BEFORE UPDATE ON `Global_Settings`
FOR EACH ROW
BEGIN
  SET NEW.change_version = UUID();
END$$

DELIMITER ;
/** ----------------------------------------------------------------------------------------- */