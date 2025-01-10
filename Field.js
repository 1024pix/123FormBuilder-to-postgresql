class Field {
  constructor({ id, name, type }) {
    this.id = id;
    this.name = name;
    this.type = type;
  }
}

class QCMField extends Field {
  constructor({ id, name, proposals }) {
    super({ id, name, type: 'qcm' });
    this.proposals = proposals;
  }
}

class QCUField extends Field {
  constructor({ id, name, proposals }) {
    super({ id, name, type: 'qcu' });
    this.proposals = proposals;
  }
}

class SelectField extends Field {
  constructor({ id, name, proposals }) {
    super({ id, name, type: 'select' });
    this.proposals = proposals;
  }
}

class IdentityField extends Field {
  constructor({ id, name }) {
    super({ id, name, type: 'identity' });
  }
}

class FieldFactory {
  static createField(field) {
    switch (field.type) {
      case 0:
        // QROC
      case 1:
        // QRO
        return new Field({ ...field, type: 'text' });
      case 2:
        return new QCMField({ ...field, proposals: field.values.split('||') });
      case 3:
        return new QCUField({ ...field, proposals: field.values.split('||') });
      case 4:
        return new SelectField({ ...field, proposals: field.values.split('||') });
      case 5:
        // Title
        return new Field({ ...field, type: 'title' });
      case 6:
        if (field.subtype === 1) {
          return new IdentityField({ ...field });
        }
        return new Field({ ...field, type: 'asset' });
      default:
        console.log(`Type ${field.type} not supported, field ${field.name} with id ${field.id}`);
        console.log({ field });
        return new Field(field);
    }
  }
}

export { Field, QCMField, FieldFactory };
