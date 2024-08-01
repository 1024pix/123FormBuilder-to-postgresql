class Field {
  constructor({ id, name, type }) {
    this.id = id;
    this.name = name;
    this.type = type;
    if (type !== 'text' && type !== 'qcm') {
      console.error(`Type ${type} not supported, field ${name} with id ${id}`);
    }
  }
}

class QCMField extends Field {
  constructor({ id, name, proposals }) {
    super({ id, name, type: 'qcm' });
    this.proposals = proposals;
  }
}

class FieldFactory {
  static createField(field) {
    switch (field.type) {
      case 1:
        return new Field({ ...field, type: 'text' });
      case 2:
        // eslint-disable-next-line no-case-declarations
        const proposals = field.values.split('||');
        return new QCMField({ ...field, proposals });
      default:
        return new Field(field);
    }
  }
}

export { Field, QCMField, FieldFactory };
