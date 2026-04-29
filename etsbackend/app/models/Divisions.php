<?php

class Divisions extends \Phalcon\Mvc\Model
{

    /**
     *
     * @var integer
     */
    public $division_id;

    /**
     *
     * @var string
     */
    public $division_name;

    /**
     *
     * @var integer
     */
    public $office_id;

    /**
     * Initialize method for model.
     */
    public function initialize()
    {
        $this->setSchema("etsdb");
        /* --- PRODUCTION --- */
        // $this->setSchema("qsadmin_etsdb");
        $this->setSource("divisions");
    
        $this->hasMany('division_id', 'ItrmServiceReport', 'division_id', ['alias' => 'ItrmServiceReport']);
        $this->hasMany('division_id', 'Personnels', 'division_id', ['alias' => 'Personnels']);
        $this->hasMany('division_id', 'Users', 'division_id', ['alias' => 'Users']);
        $this->belongsTo('office_id', '\Office', 'office_id', ['alias' => 'Office']);
    }

    /**
     * Allows to query a set of records that match the specified conditions
     *
     * @param mixed $parameters
     * @return Divisions[]|Divisions|\Phalcon\Mvc\Model\ResultSetInterface
     */
    public static function find($parameters = null): \Phalcon\Mvc\Model\ResultsetInterface
    {
        return parent::find($parameters);
    }

    /**
     * Allows to query the first record that match the specified conditions
     *
     * @param mixed $parameters
     * @return Divisions|\Phalcon\Mvc\Model\ResultInterface|\Phalcon\Mvc\ModelInterface|null
     */
    public static function findFirst($parameters = null): ?\Phalcon\Mvc\ModelInterface
    {
        return parent::findFirst($parameters);
    }

}
