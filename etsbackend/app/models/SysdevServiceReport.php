<?php

class SysdevServiceReport extends \Phalcon\Mvc\Model
{

    /**
     *
     * @var integer
     */
    public $id;

    /**
     *
     * @var string
     */
    public $control_no;

    /**
     *
     * @var string
     */
    public $date_of_request;

    /**
     *
     * @var string
     */
    public $name;

    /**
     *
     * @var string
     */
    public $dept_head;

    /**
     *
     * @var string
     */
    public $contact_no;

    /**
     *
     * @var integer
     */
    public $office_id;

    /**
     *
     * @var integer
     */
    public $division_id;

    /**
     *
     * @var string
     */
    public $issue_request;

    /**
     *
     * @var integer
     */
    public $personnel_id;

    /**
     *
     * @var integer
     */
    public $requestDiv_Id;

    /**
     *
     * @var integer
     */
    public $approval_status;

    /**
     *
     * @var integer
     */
    public $accept;

    /**
     *
     * @var string
     */
    public $property_no;

    /**
     *
     * @var string
     */
    public $services;

    /**
     *
     * @var string
     */
    public $service_level_id;

    /**
     *
     * @var string
     */
    public $service_quantity_id;

    /**
     *
     * @var string
     */
    public $action_taken;

    /**
     *
     * @var string
     */
    public $remarks;

    /**
     *
     * @var string
     */
    public $date_started;

    /**
     *
     * @var string
     */
    public $datetime_accomplished;

    /**
     *
     * @var string
     */
    public $date_released;

    /**
     *
     * @var integer
     */
    public $released;

    /**
     *
     * @var string
     */
    public $released_to;

    /**
     *
     * @var string
     */
    public $signature;

    /**
     *
     * @var string
     */
    public $request_status;

    /**
     *
     * @var string
     */
    public $task_duration;

    /**
     *
     * @var string
     */
    public $start_time;

    /**
     *
     * @var string
     */
    public $end_time;

    /**
     *
     * @var string
     */
    public $approval_datetime;

    /**
     *
     * @var string
     */
    public $time_accepted;

    /**
     *
     * @var string
     */
    public $time_assigned;

    /**
     *
     * @var string
     */
    public $process_time;

    /**
     *
     * @var string
     */
    public $datetime_noted_by;

    /**
     * Initialize method for model.
     */
    public function initialize()
    {
        $this->setSchema("etsdb");
        $this->setSource("sysdev_service_report");
    }

    /**
     * Allows to query a set of records that match the specified conditions
     *
     * @param mixed $parameters
     * @return SysdevServiceReport[]|SysdevServiceReport|\Phalcon\Mvc\Model\ResultSetInterface
     */
    public static function find($parameters = null): \Phalcon\Mvc\Model\ResultsetInterface
    {
        return parent::find($parameters);
    }

    /**
     * Allows to query the first record that match the specified conditions
     *
     * @param mixed $parameters
     * @return SysdevServiceReport|\Phalcon\Mvc\Model\ResultInterface|\Phalcon\Mvc\ModelInterface|null
     */
    public static function findFirst($parameters = null): ?\Phalcon\Mvc\ModelInterface
    {
        return parent::findFirst($parameters);
    }

}
