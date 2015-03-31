<?php
/*
**************************************************************************************************************************
** CORAL Management Module v. 1.0
**
** Copyright (c) 2010 University of Notre Dame
**
** This file is part of CORAL.
**
** CORAL is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
**
** CORAL is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details.
**
** You should have received a copy of the GNU General Public License along with CORAL.  If not, see <http://www.gnu.org/licenses/>.
**
**************************************************************************************************************************
*/


class DocumentNoteType extends DatabaseObject {

	protected function defineRelationships() {}

	protected function overridePrimaryKeyName() {}

	public function allAsIndexedArray() {
		$types = parent::allAsArray();
		if ($types) {
			$temp = array();
			foreach ($types as $type) {
				$temp[$type['documentNoteTypeID']] = $type;
			}
			return $temp;
		}
		return false;	
	}

	public function getNumberOfChildren(){
		$query = "SELECT count(*) childCount FROM DocumentNote WHERE documentNoteTypeID = '" . $this->documentNoteTypeID . "';";
		$result = $this->db->processQuery($query, 'assoc');
		return $result['childCount'];
	}
}

?>