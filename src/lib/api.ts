const API_BASE_URL = 'https://projekanda.top';

export interface SignupData {
  name: string;
  email: string;
  password: string;
  role: 'TVET' | 'ADOF' | 'ADMIN';
  interested_field?: string;
}

export interface SigninData {
  email: string;
  password: string;
}

export interface TestQuestion {
  question: string;
  question_no: number;
  trait: string;
  options: {
    score: number;
    text: string;
  }[];
}

export interface GenerateTestResponse {
  mcqs_id?: string;
  document_id?: string;
  documentId?: string;
  id?: string;
  _id?: string;
  message: string;
  questions: TestQuestion[];
  trait?: string;
}

export interface GetMcqsResponse {
  mcqs_id?: string;
  document_id?: string;
  questions: TestQuestion[];
  message?: string;
}

export interface SubmitAnswersData {
  user_id: string;
  mcq_id: string;
  answers: Record<string, string>;
}

export interface SubmitAnswersPayload extends SubmitAnswersData {
  // Ensure all fields are properly typed
}

export interface SubmitAnswersResponse {
  data: {
    analysis: Record<string, string>;
    max_score: number;
    mcq_id: string;
    percentage: number;
    result_id: string;
    total_score: number;
    user_id: string;
  };
  message: string;
}

export interface RecommendCoursesBody {
  score: number;
  interested_field: string;
}

export interface CourseItem {
  code: string;
  description: string;
  name: string;
}

export interface RecommendCoursesResponse {
  data: {
    courses: CourseItem[];
    user_input: {
      interested_field: string;
      score: number;
    };
  };
  status: string;
}

export interface TestResult {
  data: {
    analysis: Record<string, string>;
    max_score: number;
    mcq_id: string;
    percentage: number;
    result_id: string;
    total_score: number;
    user_id: string;
  };
  message: string;
}

// New Test Management Interfaces
export interface Test {
  _id: string;
  title: string;
  description: string;
  created_at: string;
}

export interface CreateTestResponse {
  message: string;
  test: Test;
}

export interface GetAllTestsResponse {
  tests: Test[];
  message?: string;
}

export interface TestQuestionOption {
  text: string;
  is_correct: boolean;
}

export interface TestQuestionNew {
  question: string;
  question_no: number;
  options: TestQuestionOption[];
}

export interface GenerateTestQuestionsResponse {
  message: string;
  data: {
    test_id: string;
    test_title: string;
    job_id: string;
    job_title: string;
    questions: TestQuestionNew[];
    generated_at: string;
  };
}

export interface SubmitTestResultPayload {
  user_id: string;
  job_id: string;
  test_id: string;
  questions: TestQuestionNew[];
  user_answers: Record<string, string>;
}

export interface SubmitTestResultResponse {
  message: string;
  data: {
    result_id: string;
    user_id: string;
    job_id: string;
    test_id: string;
    total_questions: number;
    correct_answers: number;
    wrong_answers: number;
    percentage: number;
    grade: string;
    status: string;
    submitted_at: string;
  };
}

export interface CreateTestData {
  title: string;
  description: string;
}

export interface UpdateTestData {
  title: string;
  description: string;
}

export interface UpdateTestResponse {
  message: string;
  test: Test;
}

export interface DeleteTestResponse {
  message: string;
}

export interface GenerateTestQuestionsData {
  job_id: string;
  test_id: string;
}

export interface SubmitTestResultData {
  user_id: string;
  job_id: string;
  test_id: string;
  questions: TestQuestionNew[];
  user_answers: Record<string, string>;
}

export const api = {
  async signup(data: SignupData) {
    // Validate input
    if (!data.email?.trim()) {
      throw new Error('Email is required');
    }
    if (!data.password?.trim()) {
      throw new Error('Password is required');
    }
    if (!data.name?.trim()) {
      throw new Error('Name is required');
    }
    if (!data.role) {
      throw new Error('Role is required');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(`${API_BASE_URL}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        signal: controller.signal,
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Signup failed');
      }

      return response.json();
    } finally {
      clearTimeout(timeoutId);
    }
  },

  async signin(data: SigninData) {
    // Validate input
    if (!data.email?.trim()) {
      throw new Error('Email is required');
    }
    if (!data.password?.trim()) {
      throw new Error('Password is required');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(`${API_BASE_URL}/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        signal: controller.signal,
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Signin failed');
      }

      return response.json();
    } finally {
      clearTimeout(timeoutId);
    }
  },

  async generateTest(userId: string): Promise<GenerateTestResponse> {
    if (!userId?.trim()) {
      throw new Error('User ID is required');
    }

    console.log('Generating test for user:', userId);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    try {
      const response = await fetch(`${API_BASE_URL}/generate_test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Test generation failed');
      }

      const result = await response.json();
      console.log('Generate test API response:', result);
      return result;
    } finally {
      clearTimeout(timeoutId);
    }
  },

  async getMcqs(userId: string): Promise<GetMcqsResponse> {
    console.log('Getting MCQs for user:', userId);
    
    const response = await fetch(`${API_BASE_URL}/get_mcqs/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const responseText = await response.text();
    
    console.log('=== GET MCQS DEBUG ===');
    console.log('URL:', `${API_BASE_URL}/get_mcqs/${userId}`);
    console.log('Status:', response.status);
    console.log('Response:', responseText);
    console.log('=====================');

    if (!response.ok) {
      let errorMessage = 'Failed to get MCQs';
      try {
        const errorData = JSON.parse(responseText);
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch {
        errorMessage = responseText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    try {
      const result = JSON.parse(responseText);
      console.log('Get MCQs API response:', result);
      return result;
    } catch (error) {
      console.error('Failed to parse MCQs response:', responseText);
      throw new Error('Invalid response format from server');
    }
  },

  async submitAnswers(data: SubmitAnswersData): Promise<SubmitAnswersResponse> {
    // Validate input data
    if (!data.user_id?.trim()) {
      throw new Error('User ID is required');
    }
    if (!data.mcq_id?.trim()) {
      throw new Error('MCQ ID is required');
    }
    if (!data.answers || Object.keys(data.answers).length === 0) {
      throw new Error('Answers are required');
    }

    const url = `${API_BASE_URL}/submit_answers`;
    const requestBody = JSON.stringify(data);
    
    console.log('=== API SUBMIT DEBUG ===');
    console.log('URL:', url);
    console.log('Method: POST');
    console.log('Headers:', { 'Content-Type': 'application/json' });
    console.log('Request data object:', data);
    console.log('Request body string:', requestBody);
    console.log('Request body length:', requestBody.length);
    console.log('========================');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: requestBody,
        signal: controller.signal,
      });

      // Read the response body once
      const responseText = await response.text();
      
      console.log('=== API RESPONSE DEBUG ===');
      console.log('Status:', response.status);
      console.log('Status Text:', response.statusText);
      console.log('Headers:', Object.fromEntries(response.headers.entries()));
      console.log('Response body:', responseText);
      console.log('Response length:', responseText.length);
      console.log('==========================');
      
      if (!response.ok) {
        let errorMessage = 'Answer submission failed';
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          errorMessage = responseText || errorMessage;
        }
        console.error('API Error Response:', responseText);
        throw new Error(errorMessage);
      }

      try {
        return JSON.parse(responseText);
      } catch (error) {
        console.error('Failed to parse response:', responseText);
        throw new Error('Invalid response format from server');
      }
    } finally {
      clearTimeout(timeoutId);
    }
  },

  async getResultById(resultId: string): Promise<TestResult> {
    const response = await fetch(`${API_BASE_URL}/get_result_by_id?result_id=${resultId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const responseText = await response.text();

    if (!response.ok) {
      let errorMessage = 'Failed to fetch result';
      try {
        const errorData = JSON.parse(responseText);
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch {
        errorMessage = responseText || errorMessage;
      }
      console.error('API Error Response:', responseText);
      throw new Error(errorMessage);
    }

    try {
      return JSON.parse(responseText);
    } catch (error) {
      console.error('Failed to parse response:', responseText);
      throw new Error('Invalid response format from server');
    }
  },
  
  async downloadReport(resultId: string): Promise<Blob> {
    if (!resultId?.trim()) {
      throw new Error('Valid result ID is required');
    }
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    try {
      const response = await fetch(`${API_BASE_URL}/generate-report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ result_id: resultId }),
        signal: controller.signal
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Report generation failed: ${errorText || response.statusText}`);
      }
      
      return await response.blob();
    } finally {
      clearTimeout(timeoutId);
    }
  },

  async recommendCourses(score: number, interested_field: string): Promise<RecommendCoursesResponse> {
    if (typeof score !== 'number' || isNaN(score) || score < 0) {
      throw new Error('Valid score is required');
    }
    if (!interested_field?.trim()) {
      throw new Error('Valid interested field is required');
    }
    
    const response = await fetch(`${API_BASE_URL}/recommend-courses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ score, interested_field }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Course recommendation failed: ${errorText || response.statusText}`);
    }

    return await response.json();
  },

  // New Test Management APIs
  async createTest(data: CreateTestData): Promise<CreateTestResponse> {
    if (!data.title?.trim()) {
      throw new Error('Test title is required');
    }
    if (!data.description?.trim()) {
      throw new Error('Test description is required');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(`${API_BASE_URL}/tests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        signal: controller.signal,
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Test creation failed');
      }

      return await response.json();
    } finally {
      clearTimeout(timeoutId);
    }
  },

  async getAllTests(): Promise<GetAllTestsResponse> {
    console.log('API: Fetching all tests from', `${API_BASE_URL}/tests`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(`${API_BASE_URL}/tests`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      console.log('API: getAllTests response status:', response.status);

      if (!response.ok) {
        const error = await response.text();
        console.error('API: getAllTests error:', error);
        throw new Error(error || 'Failed to fetch tests');
      }

      const data = await response.json();
      console.log('API: getAllTests data:', data);
      
      // Handle both array and object response formats
      if (Array.isArray(data)) {
        return { tests: data };
      }
      
      return data;
    } catch (err) {
      console.error('API: getAllTests exception:', err);
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }
  },

  async updateTest(testId: string, data: UpdateTestData): Promise<UpdateTestResponse> {
    if (!testId?.trim()) {
      throw new Error('Test ID is required');
    }
    if (!data.title?.trim()) {
      throw new Error('Test title is required');
    }
    if (!data.description?.trim()) {
      throw new Error('Test description is required');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(`${API_BASE_URL}/tests/${testId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        signal: controller.signal,
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Test update failed');
      }

      return await response.json();
    } finally {
      clearTimeout(timeoutId);
    }
  },

  async deleteTest(testId: string): Promise<DeleteTestResponse> {
    if (!testId?.trim()) {
      throw new Error('Test ID is required');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(`${API_BASE_URL}/tests/${testId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Test deletion failed');
      }

      return await response.json();
    } finally {
      clearTimeout(timeoutId);
    }
  },

  async generateTestQuestions(data: GenerateTestQuestionsData): Promise<GenerateTestQuestionsResponse> {
    if (!data.job_id?.trim()) {
      throw new Error('Job ID is required');
    }
    if (!data.test_id?.trim()) {
      throw new Error('Test ID is required');
    }

    console.log('Generating test questions for:', data);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(`${API_BASE_URL}/generate-test-questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        signal: controller.signal,
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Test questions generation failed');
      }

      const result = await response.json();
      console.log('Generate test questions API response:', result);
      return result;
    } finally {
      clearTimeout(timeoutId);
    }
  },

  async submitTestResult(data: SubmitTestResultData): Promise<SubmitTestResultResponse> {
    if (!data.user_id?.trim()) {
      throw new Error('User ID is required');
    }
    if (!data.job_id?.trim()) {
      throw new Error('Job ID is required');
    }
    if (!data.test_id?.trim()) {
      throw new Error('Test ID is required');
    }
    if (!data.questions || data.questions.length === 0) {
      throw new Error('Questions are required');
    }
    if (!data.user_answers || Object.keys(data.user_answers).length === 0) {
      throw new Error('User answers are required');
    }

    console.log('Submitting test result:', data);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(`${API_BASE_URL}/submit-test-result`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        signal: controller.signal,
      });

      const responseText = await response.text();
      
      console.log('=== SUBMIT TEST RESULT DEBUG ===');
      console.log('Status:', response.status);
      console.log('Response:', responseText);
      console.log('================================');

      if (!response.ok) {
        let errorMessage = 'Test result submission failed';
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          errorMessage = responseText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      try {
        return JSON.parse(responseText);
      } catch (error) {
        console.error('Failed to parse response:', responseText);
        throw new Error('Invalid response format from server');
      }
    } finally {
      clearTimeout(timeoutId);
    }
  },
};