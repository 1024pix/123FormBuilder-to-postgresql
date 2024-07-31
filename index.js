import 'dotenv/config'
import {env} from 'node:process'

async function main() {
  const formBuilder = new FormBuilderClient(
    env['123_FORM_BUILDER_URL'],
    env['123_FORM_BUILDER_USERNAME'],
    env['123_FORM_BUILDER_PASSWORD'],
  );

  const formPixOrga = 50313;

  const formSubmissions = await formBuilder.getFormSubmissions(formPixOrga);
  formSubmissions.forEach(submission => {
    console.log(submission.id);
    console.log(submission.fieldResponses);
  });
}

class HttpClient {
  async get(url, headers) {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    });
    return response.json();
  }

  async post(url, body, headers) {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(body),
    });
    return response.json();
  }
}

class FormBuilderClient {
  #httpClient;
  #baseUrl;
  #username;
  #password;
  #token;

  constructor(url, username, password) {
    this.#baseUrl = url;
    this.#username = username;
    this.#password = password;
    this.#httpClient = new HttpClient();
  }

  async getToken() {
    if (this.#token) {
      return this.#token;
    }

    const tokenUrl = `${this.#baseUrl}/token`;
    const response = await this.#httpClient.post(tokenUrl, {
      username: this.#username,
      password: this.#password,
    }, {});
    this.#token = response.token;
    return this.#token;
  }

  async getList() {
    const token = await this.getToken();
    const formsUrl = `${this.#baseUrl}/forms`;
    return this.#httpClient.get(formsUrl, {
      'Authorization': `Bearer ${token}`,
    });
  }

  async getFormDetails(formId) {
    const token = await this.getToken();

    const formUrl = `${this.#baseUrl}/forms/${formId}`;
    return this.#httpClient.get(formUrl, {
      'Authorization': `Bearer ${token}`,
    });
  }

  async getFormFields(formId) {
    const token = await this.getToken();
    const formUrl = `${this.#baseUrl}/forms/${formId}`;
    const result = await this.#httpClient.get(`${formUrl}/fields`, {
      'Authorization': `Bearer ${token}`,
    });
    return result.data.controls.data.map(field => FieldFactory.createField(field));
  }

  async getFormSubmissions(formId) {
    const token = await this.getToken();

    const fields = await this.getFormFields(formId);

    const formUrl = `${this.#baseUrl}/forms/${formId}/submissions`;
    const result = await this.#httpClient.get(formUrl, {
      'Authorization': `Bearer ${token}`,
    });

    return result.data.map(submission => {
      const fieldResponses = fields.map(field => FieldResponseFactory.createFieldResponse(field));
      const fieldsData = submission.content.fields.field;
      fieldsData.forEach((field) => {
        const foundFieldResponse = fieldResponses.find(f => field.fieldid.includes(f.id));
        if (!foundFieldResponse) {
          console.error(`Field with id ${field.fieldid} not found`);
        } else {
          foundFieldResponse.insertResponse(field);
        }
      });
      return { id: submission.id, fieldResponses };
    });
  }
}

class Field {
  constructor({ id, name, type, values }) {
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
        const proposals = field.values.split('||');
        return new QCMField({ ...field, proposals});
      default:
        return new Field(field);
    }
  }
}

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

main().then().catch(console.error)