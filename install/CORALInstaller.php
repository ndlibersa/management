<?php
session_start();
require_once('../directory.php');

if (!function_exists('debug')) {
	function debug($value) {
		echo '<pre>'.print_r($value, true).'</pre>';
	}
}

class CORALInstaller {

	protected $db;
	public $error;
	protected $config;
	protected $updates = array();

	public function __construct() {
		if (is_file($this->configFilePath())) {
			$this->config = new Configuration();
			$this->connect();
		}
	}

	public function connect($username = null, $password = null) {
		$this->error = '';
		$host = $this->config->database->host;
		if ($username === null) {
			$username = $this->config->database->username;
		}
		if ($password === null) {
			$password = $this->config->database->password;
		}
		$this->db = new mysqli($host, $username, $password);
		if ($this->db->connect_error) {

			$this->error = $this->db->connect_error;
			if (!$this->error) {
				$this->error = "Access denied for user '$username'";
			}
		} else {
			$databaseName = $this->config->database->name;
			$this->db->select_db($databaseName);
			$this->error = $this->db->error;
		}

		if ($this->error) {
			$this->db = null;
		}
	}

	public function query($sql) {
		$result = $this->db->query($sql);

		$this->checkForError();
		$data = array();

		if ($result instanceof mysqli_result) {
			while ($row = $result->fetch_array()) {
				array_push($data, $row);
			}
		} else if ($result) {
			$data = $this->db->insert_id;
		}

		return $data;
	}

	protected function checkForError() {
		if ($this->error = $this->db->error) {
			throw new Exception("There was a problem with the database: " . $this->error);
		}
	}

	public function getDatabaseName() {
		return $this->config->database->name;
	}

	public function addErrorMessage($error) {
		if (!$this->hasErrorMessages()) {
			$_SESSION['installer_error_messages'] = array();
		}
		$_SESSION['installer_error_messages'] []= $error;
	}

	public function hasErrorMessages() {
		return isset($_SESSION['installer_error_messages']);
	}

	public function displayErrorMessages() {
		if ($this->hasErrorMessages()) {
			echo "<div style='color:red'><p><b>The following errors occurred:</b></p><ul>";
			foreach ($_SESSION['installer_error_messages'] as $err) {
				echo "<li>" . $err . "</li>";
			}
			echo "</ul></div>";
			unset($_SESSION['installer_error_messages']);
		}
	}

	public function addMessage($msg) {
		if (!$this->hasMessages()) {
			$_SESSION['installer_messages'] = array();
		}
		$_SESSION['installer_messages'] []= $msg;
	}

	public function hasMessages() {
		return isset($_SESSION['installer_messages']);
	}

	public function displayMessages() {
		if ($this->hasMessages()) {
			echo "<div style='color:green'><ul>";
			foreach ($_SESSION['installer_messages'] as $msg) {
				echo "<li>" . $msg . "</li>";
			}
			echo "</ul></div>";
			unset($_SESSION['installer_messages']);
		}
	}

	public function modulePath() {
		//returns file path for this module, i.e. /coral/Management/
		$replace_path = preg_quote(DIRECTORY_SEPARATOR."install");
		return preg_replace("@$replace_path$@", "", dirname(__FILE__));
	}

	public function configFilePath() {
		return $this->modulePath().'/admin/configuration.ini';
	}

	public function isDatabaseConfigValid() {
		return $this->config && $this->db;
	}

	public function hasPermission($permission) {
		if ($this->isDatabaseConfigValid()) {
			$grants = array();
			$permission = "(ALL PRIVILEGES|".strtoupper($permission).")";
			foreach ($this->query("SHOW GRANTS FOR CURRENT_USER()") as $row) {
				$grant = $row[0];
				if (strpos(str_replace('\\', '', $grant), $this->config->database->name) || strpos($grant, "ON *.*")) {
					if (preg_match("/(GRANT|,) $permission(,| ON)/i",$grant)) {
						return true;
					}
				}
			}
		}
		return false;
	}

	public function hasPermissions($permissions) {
		foreach($permissions as $permission) {
			if (!$this->hasPermission($permission)) {
				return false;
			}
		}
		return true;
	}

	public function tableExists($table) {
		foreach ($this->query("SHOW TABLES") as $row) {
			if (strtolower($row[0]) == strtolower($table)) {
				return true;
			}
		}
		return false;
	}

	public function indexExists($table, $index) {
		$result = $this->query("SHOW INDEXES FROM $table WHERE Key_name = '$index'");
		return count($result) > 0;
	}

	public function installed() {
		if ($this->isDatabaseConfigValid()) {
			foreach (array("License","Document","Expression") as $table) {
				if (!$this->tableExists($table)) {
					return false;
				}
			}
			return true;
		}
		return false;
	}

	public function getNextUpdateVersion() {
		foreach($this->updates as $version => $details) {
			if (!$this->isUpdateInstalled($version)) {
				return $version;
			}
		}
	}

	public function isUpdateReady($version) {
		return $this->getNextUpdateVersion() == $version;
	}

	public function isUpdateInstalled($version) {
		if ($this->installed()) {
			switch ($version) {
			}
		}
		return false;
	}

	public function getUpdate($version) {
		return $this->updates[$version];
	}

	public function header($title = 'CORAL Installation') {
		include('header.php');
	}

	public function footer() {
		include('footer.php');
	}
}
?>
