<?php

class ItEquipment extends \Phalcon\Mvc\Model
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
    public $brand_type;

    /**
     *
     * @var string
     */
    public $brand;

    /**
     *
     * @var string
     */
    public $model;

    /**
     *
     * @var string
     */
    public $serial_number;

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
     * Initialize method for model.
     */
    public function initialize()
    {
        $this->setSchema("etsdb");
        $this->setSource("it_equipment");
        $this->hasMany('id', 'DeviceEquipmentTypes', 'device_id', ['alias' => 'DeviceEquipmentTypes']);
        $this->hasMany('id', 'DeviceHardware', 'device_id', ['alias' => 'DeviceHardware']);
        $this->hasMany('id', 'DeviceMemory', 'device_id', ['alias' => 'DeviceMemory']);
        $this->hasMany('id', 'DeviceNetwork', 'device_id', ['alias' => 'DeviceNetwork']);
        $this->hasMany('id', 'DeviceSoftware', 'device_id', ['alias' => 'DeviceSoftware']);
    }

    /**
     * Allows to query a set of records that match the specified conditions
     *
     * @param mixed $parameters
     * @return ItEquipment[]|ItEquipment|\Phalcon\Mvc\Model\ResultSetInterface
     */
    public static function find($parameters = null): \Phalcon\Mvc\Model\ResultsetInterface
    {
        return parent::find($parameters);
    }

    /**
     * Allows to query the first record that match the specified conditions
     *
     * @param mixed $parameters
     * @return ItEquipment|\Phalcon\Mvc\Model\ResultInterface|\Phalcon\Mvc\ModelInterface|null
     */
    public static function findFirst($parameters = null): ?\Phalcon\Mvc\ModelInterface
    {
        return parent::findFirst($parameters);
    }

}
