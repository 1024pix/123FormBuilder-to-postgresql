import 'dotenv/config';
import { env } from 'node:process';
import { HttpClient } from './HttpClient.js';
import { FieldFactory } from './Field.js';
import { FieldResponseFactory } from './FieldResponse.js';

async function main() {
  const formBuilder = new FormBuilderClient(
    env['123_FORM_BUILDER_URL'],
    env['123_FORM_BUILDER_USERNAME'],
    env['123_FORM_BUILDER_PASSWORD'],
  );

  const formPixOrga = 50313;

  const formSubmissions = await formBuilder.getFormSubmissions(formPixOrga);
  formSubmissions.forEach((submission) => {
    // eslint-disable-next-line no-console
    console.log(submission.id);
    // eslint-disable-next-line no-console
    console.log(submission.fieldResponses);
  });
}

class FormBuilderClient {
  #httpClient;
  #baseUrl;
  #username;
  #password;
  #token;

  constructor(url, username, password, httpClient = new HttpClient()) {
    this.#baseUrl = url;
    this.#username = username;
    this.#password = password;
    this.#httpClient = httpClient;
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
      Authorization: `Bearer ${token}`,
    });
  }

  async getFormDetails(formId) {
    const token = await this.getToken();

    const formUrl = `${this.#baseUrl}/forms/${formId}`;
    return this.#httpClient.get(formUrl, {
      Authorization: `Bearer ${token}`,
    });
  }

  async getFormFields(formId) {
    const token = await this.getToken();
    const formUrl = `${this.#baseUrl}/forms/${formId}`;
    const result = await this.#httpClient.get(`${formUrl}/fields`, {
      Authorization: `Bearer ${token}`,
    });
    return result.data.controls.data.map(field => FieldFactory.createField(field));
  }

  async getFormSubmissions(formId) {
    const token = await this.getToken();

    const fields = await this.getFormFields(formId);

    const formUrl = `${this.#baseUrl}/forms/${formId}/submissions`;
    const result = await this.#httpClient.get(formUrl, {
      Authorization: `Bearer ${token}`,
    });

    return result.data.map((submission) => {
      const fieldResponses = fields.map(field => FieldResponseFactory.createFieldResponse(field));
      const fieldsData = submission.content.fields.field;
      fieldsData.forEach((field) => {
        const foundFieldResponse = fieldResponses.find(f => field.fieldid.includes(f.id));
        if (!foundFieldResponse) {
          console.error(`Field with id ${field.fieldid} not found`);
        }
        else {
          foundFieldResponse.insertResponse(field);
        }
      });
      return { id: submission.id, fieldResponses };
    });
  }
}

main().then().catch(console.error);
