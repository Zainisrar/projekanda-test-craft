const API_BASE_URL = 'https://projekanda.top';

export interface SignupData {
  name: string;
  email: string;
  password: string;
  role: 'TVET' | 'ADOF';
}

export interface SigninData {
  email: string;
  password: string;
}

export interface TestQuestion {
  options: {
    score: number;
    text: string;
  }[];
}

export interface GenerateTestResponse {
  document_id: string;
  message: string;
  questions: TestQuestion[];
}

export const api = {
  async signup(data: SignupData) {
    const response = await fetch(`${API_BASE_URL}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Signup failed');
    }

    return response.json();
  },

  async signin(data: SigninData) {
    const response = await fetch(`${API_BASE_URL}/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Signin failed');
    }

    return response.json();
  },

  async generateTest(userId: string): Promise<GenerateTestResponse> {
    const response = await fetch(`${API_BASE_URL}/generate_test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: userId }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Test generation failed');
    }

    return response.json();
  },
};