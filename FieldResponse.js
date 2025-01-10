class FieldResponse {
  constructor(formField) {
    this.id = formField.id;
    this.fieldName = formField.name;
    this.type = formField.type;
    this.formField = formField;
  }

  insertResponse(field) {
    this.response = field.fieldvalue;
  }

  get responses() {
    return {
      id: this.id,
      fieldName: this.fieldName,
      responses: this.response,
      type: this.type,
    };
  }
}

class TextFieldResponse extends FieldResponse {
  insertResponse({ fieldvalue }) {
    this.response = fieldvalue;
  }

  get responses() {
    return {
      id: this.id,
      fieldName: this.fieldName,
      responses: this.response,
      type: this.type,
    };
  }
}

class QCMPFieldResponse extends FieldResponse {
  #responses;

  constructor(formField) {
    super(formField);
    this.#responses = [];
  }

  insertResponse(field) {
    const proposalId = Number(field.fieldid.split('_')[1]);
    if (field.fieldvalue === 'yes') {
      this.#responses.push(this.formField.proposals[proposalId]);
    }
  }

  get responses() {
    return {
      id: this.id,
      fieldName: this.fieldName,
      proposals: this.formField.proposals,
      responses: this.#responses,
      type: this.type,
    };
  }
}

class QCUPFieldResponse extends FieldResponse {
  #response;

  constructor(formField) {
    super(formField);
  }

  insertResponse(field) {
    const value = field.fieldvalue;
    if (value !== undefined && Object.keys(value).length !== 0) {
      this.#response = field.fieldvalue;
    }
  }

  get responses() {
    return {
      id: this.id,
      fieldName: this.fieldName,
      proposals: this.formField.proposals,
      responses: this.#response,
      type: this.type,
    };
  }
}

class IdentityFieldResponse extends FieldResponse {
  #responses;

  constructor(formField) {
    super(formField);
    this.#responses = [];
  }

  insertResponse(field) {
    this.#responses.push(field.fieldvalue);
  }

  get responses() {
    return {
      id: this.id,
      type: this.type,
      responses: this.#responses,
    };
  }
}

class FieldResponseFactory {
  static createFieldResponse(formField) {
    switch (formField.type) {
      case 'text':
        return new TextFieldResponse(formField);
      case 'qcm':
        return new QCMPFieldResponse(formField);
      case 'qcu':
        return new QCUPFieldResponse(formField);
      case 'identity':
        return new IdentityFieldResponse(formField);
      default:
        return new FieldResponse(formField);
    }
  }
}

export { FieldResponse, TextFieldResponse, QCMPFieldResponse, FieldResponseFactory };
