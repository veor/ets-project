<?php

class DeviceHardware extends \Phalcon\Mvc\Model
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
    public $motherboard_brand;

    /**
     *
     * @var string
     */
    public $motherboard_serial;

    /**
     *
     * @var string
     */
    public $processor_brand;

    /**
     *
     * @var string
     */
    public $processor_serial;

    /**
     *
     * @var string
     */
    public $monitor_brand;

    /**
     *
     * @var string
     */
    public $monitor_serial;

    /**
     *
     * @var string
     */
    public $gpu_brand;

    /**
     *
     * @var string
     */
    public $gpu_serial;

    /**
     *
     * @var string
     */
    public $ups_brand;

    /**
     *
     * @var string
     */
    public $ups_serial;

    /**
     *
     * @var string
     */
    public $printer_brand;

    /**
     *
     * @var string
     */
    public $printer_serial;

    /**
     *
     * @var string
     */
    public $data_cabinet_brand;

    /**
     *
     * @var string
     */
    public $data_cabinet_serial;

    /**
     *
     * @var string
     */
    public $network_switch_brand;

    /**
     *
     * @var string
     */
    public $network_switch_serial;

    /**
     * Initialize method for model.
     */
    public function initialize()
    {
        $this->setSchema("etsdb");
        $this->setSource("device_hardware");
        $this->belongsTo('device_id', '\ItEquipment', 'id', ['alias' => 'ItEquipment']);
    }

    /**
     * Allows to query a set of records that match the specified conditions
     *
     * @param mixed $parameters
     * @return DeviceHardware[]|DeviceHardware|\Phalcon\Mvc\Model\ResultSetInterface
     */
    public static function find($parameters = null): \Phalcon\Mvc\Model\ResultsetInterface
    {
        return parent::find($parameters);
    }

    /**
     * Allows to query the first record that match the specified conditions
     *
     * @param mixed $parameters
     * @return DeviceHardware|\Phalcon\Mvc\Model\ResultInterface|\Phalcon\Mvc\ModelInterface|null
     */
    public static function findFirst($parameters = null): ?\Phalcon\Mvc\ModelInterface
    {
        return parent::findFirst($parameters);
    }

}
