<?php

class DeviceSoftware extends \Phalcon\Mvc\Model
{

    /**
     *
     * @var integer
     */
    public $id;

    /**
     *
     * @var integer
     */
    public $device_id;

    /**
     *
     * @var string
     */
    public $computer_name;

    /**
     *
     * @var string
     */
    public $operating_system;

    /**
     *
     * @var string
     */
    public $os_license_key;

    /**
     *
     * @var string
     */
    public $productivity_suite;

    /**
     *
     * @var string
     */
    public $productivity_license_key;

    /**
     *
     * @var string
     */
    public $endpoint_protection;

    /**
     *
     * @var string
     */
    public $bitlocker_key;

    /**
     *
     * @var string
     */
    public $device_name;

    /**
     * Initialize method for model.
     */
    public function initialize()
    {
        $this->setSchema("etsdb");
        $this->setSource("device_software");
        $this->belongsTo('device_id', '\ItEquipment', 'id', ['alias' => 'ItEquipment']);
    }

    /**
     * Allows to query a set of records that match the specified conditions
     *
     * @param mixed $parameters
     * @return DeviceSoftware[]|DeviceSoftware|\Phalcon\Mvc\Model\ResultSetInterface
     */
    public static function find($parameters = null): \Phalcon\Mvc\Model\ResultsetInterface
    {
        return parent::find($parameters);
    }

    /**
     * Allows to query the first record that match the specified conditions
     *
     * @param mixed $parameters
     * @return DeviceSoftware|\Phalcon\Mvc\Model\ResultInterface|\Phalcon\Mvc\ModelInterface|null
     */
    public static function findFirst($parameters = null): ?\Phalcon\Mvc\ModelInterface
    {
        return parent::findFirst($parameters);
    }

}
