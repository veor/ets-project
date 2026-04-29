<?php

class PreventiveMaintenance extends \Phalcon\Mvc\Model
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
    public $accountable_person;

    /**
     *
     * @var string
     */
    public $end_user;

    /**
     *
     * @var string
     */
    public $designation;

    /**
     *
     * @var string
     */
    public $equipment_type;

    /**
     *
     * @var string
     */
    public $par_ics;

    /**
     *
     * @var string
     */
    public $computer_name;

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
    public $status;

    /**
     *
     * @var string
     */
    public $created_at;

    /**
     *
     * @var string
     */
    public $updated_at;

    /**
     * Initialize method for model.
     */
    public function initialize()
    {
        $this->setSchema("etsdb");
        /* --- PRODUCTION --- */
        // $this->setSchema("qsadmin_etsdb");
        $this->setSource("preventive_maintenance");
        $this->belongsTo('division_id', '\Divisions', 'division_id', ['alias' => 'Divisions']);
        $this->belongsTo('office_id', '\Office', 'office_id', ['alias' => 'Office']);
    }

    /**
     * Allows to query a set of records that match the specified conditions
     *
     * @param mixed $parameters
     * @return PreventiveMaintenance[]|PreventiveMaintenance|\Phalcon\Mvc\Model\ResultSetInterface
     */
    public static function find($parameters = null): \Phalcon\Mvc\Model\ResultsetInterface
    {
        return parent::find($parameters);
    }

    /**
     * Allows to query the first record that match the specified conditions
     *
     * @param mixed $parameters
     * @return PreventiveMaintenance|\Phalcon\Mvc\Model\ResultInterface|\Phalcon\Mvc\ModelInterface|null
     */
    public static function findFirst($parameters = null): ?\Phalcon\Mvc\ModelInterface
    {
        return parent::findFirst($parameters);
    }

}
