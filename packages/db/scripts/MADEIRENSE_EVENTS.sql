USE u322092759_PACIFICO;

SET GLOBAL event_scheduler=ON;
/** -------------------------------------------------------------------------------------------------------------------------- */

/** -- CLEAN-UP ----------------------------------------------------------------------------- */
CREATE EVENT IF NOT EXISTS Remove_Expired_Carts
ON SCHEDULE EVERY 1 HOUR DO
	DELETE FROM Cart 
	WHERE added_at < NOW() - INTERVAL 24 HOUR;
/** ----------------------------------------------------------------------------------------- */

/** -- USER MANAGEMENT ---------------------------------------------------------------------- */
CREATE EVENT IF NOT EXISTS Unblock_Expired_Users
ON SCHEDULE EVERY 1 HOUR DO
  DELETE FROM Blocked_Users
  WHERE expires_at IS NOT NULL
    AND expires_at <= NOW();
/** ----------------------------------------------------------------------------------------- */

/** -------------------------------------------------------------------------------------------------------------------------- */