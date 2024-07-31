class FieldResponse {
  constructor(formField) {
    this.id = formField.id;
    this.fieldName = formField.name;
    this.type = formField.type;
    this.formField = formField;
  }
}

class TextFieldResponse extends FieldResponse {
  constructor(formField) {
    super(formField);
  }

  insertResponse({ fieldvalue }) {
    this.value = fieldvalue;
  }

  get responses() {
    return {
      id: this.id,
      fieldName: this.fieldName,
      value: this.value,
    }
  }
}

class QCMPFieldResponse extends FieldResponse {
  #responses;

  constructor(formField) {
    super(formField);
    this.#responses = Array(formField.proposals.length);
  }

  insertResponse(field) {
    const proposalId = field.fieldid.split('_')[1];
    this.#responses[proposalId - 1] = field.value;
  }

  get responses() {
    return {
      id: this.id,
      fieldName: this.fieldName,
      proposals: this.formField.proposals,
      responses: this.#responses,
      value: this.value,
    }
  }
}

class FieldResponseFactory {
  static createFieldResponse(formField) {
    switch (formField.type) {
      case 'text':
        return new TextFieldResponse(formField);
      case 'qcm':
        return new QCMPFieldResponse(formField);
      default:
        return new TextFieldResponse(formField);
    }
  }
}

export { FieldResponse, TextFieldResponse, QCMPFieldResponse, FieldResponseFactory };