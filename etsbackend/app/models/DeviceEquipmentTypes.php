<?php

class DeviceEquipmentTypes extends \Phalcon\Mvc\Model
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
    public $equipment_type;

    /**
     * Initialize method for model.
     */
    public function initialize()
    {
        $this->setSchema("etsdb");
        $this->setSource("device_equipment_types");
        $this->belongsTo('device_id', '\ItEquipment', 'id', ['alias' => 'ItEquipment']);
    }

    /**
     * Allows to query a set of records that match the specified conditions
     *
     * @param mixed $parameters
     * @return DeviceEquipmentTypes[]|DeviceEquipmentTypes|\Phalcon\Mvc\Model\ResultSetInterface
     */
    public static function find($parameters = null): \Phalcon\Mvc\Model\ResultsetInterface
    {
        return parent::find($parameters);
    }

    /**
     * Allows to query the first record that match the specified conditions
     *
     * @param mixed $parameters
     * @return DeviceEquipmentTypes|\Phalcon\Mvc\Model\ResultInterface|\Phalcon\Mvc\ModelInterface|null
     */
    public static function findFirst($parameters = null): ?\Phalcon\Mvc\ModelInterface
    {
        return parent::findFirst($parameters);
    }

}
