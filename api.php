<?php
class tagsAPI extends CRUDAPI {
	public function delete($request = null, $data = null){
		if(isset($data)){
			$data = json_decode($data, true);
			$record = $this->Auth->read($request,$data['name'],'name')->all()[0];
			$result = $this->Auth->delete($request,$record['id']);
			if((is_int($result))&&($result > 0)){
				$results = [
					"success" => $this->Language->Field["Record successfully deleted"],
					"request" => $request,
					"data" => $data,
					"output" => [
						'results' => $result,
						'record' => $record,
					],
				];
			} else {
				$results = [
					"error" => $this->Language->Field["Unable to complete the request"],
					"request" => $request,
					"data" => $data,
					"output" => [
						'results' => $result,
					],
				];
			}
		} else {
			$results = [
				"error" => $this->Language->Field["Unable to complete the request"],
				"request" => $request,
				"data" => $data,
			];
		}
		return $results;
	}
}
