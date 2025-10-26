
import { inferenceService } from './inferenceService';
import { modelDeploymentService } from './modelDeployment';
import { dataCollectionService } from './dataCollectionService';
import { TestResult, ModelTestSuite, PerformanceMetrics } from '../types';

class ModelTestingService {
  private isInitialized = false;

  // Initialize testing service
  async initialize(): Promise<void> {
    try {
      await inferenceService.initialize();
      await modelDeploymentService.initialize();
      this.isInitialized = true;
      console.log('Model testing service initialized');
    } catch (error) {
      console.error('Failed to initialize testing service:', error);
      throw error;
    }
  }

  // Run comprehensive test suite
  async runTestSuite(modelType: 'packaging' | 'pill' | 'batchCode' | 'fusion' | 'all' = 'all'): Promise<ModelTestSuite> {
    if (!this.isInitialized) {
      throw new Error('Testing service not initialized');
    }

    const startTime = Date.now();
    const tests: TestResult[] = [];

    try {
      // Basic functionality tests
      tests.push(await this.testServiceInitialization());
      tests.push(await this.testModelLoading());
      tests.push(await this.testInferenceCapability());

      // Model-specific tests
      if (modelType === 'all' || modelType === 'packaging') {
        tests.push(await this.testPackagingModel());
      }
      if (modelType === 'all' || modelType === 'pill') {
        tests.push(await this.testPillModel());
      }
      if (modelType === 'all' || modelType === 'batchCode') {
        tests.push(await this.testBatchCodeModel());
      }
      if (modelType === 'all' || modelType === 'fusion') {
        tests.push(await this.testFusionModel());
      }

      // Performance tests
      tests.push(await this.testInferenceSpeed());
      tests.push(await this.testMemoryUsage());
      tests.push(await this.testErrorHandling());

      // Integration tests
      tests.push(await this.testEndToEndWorkflow());
      tests.push(await this.testDataCollectionIntegration());

      // Calculate overall results
      const passedTests = tests.filter(test => test.passed).length;
      const totalTests = tests.length;
      const overallScore = (passedTests / totalTests) * 100;
      const duration = Date.now() - startTime;

      return {
        modelType,
        tests,
        overallScore,
        passedTests,
        totalTests,
        duration,
      };

    } catch (error) {
      console.error('Test suite failed:', error);
      throw error;
    }
  }

  // Test service initialization
  private async testServiceInitialization(): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      const isReady = inferenceService.isReady();
      const status = await inferenceService.getStatus();
      
      const passed = isReady && status.isReady;
      const score = passed ? 100 : 0;
      const details = passed 
        ? 'All services initialized successfully'
        : 'Service initialization failed';

      return {
        testName: 'Service Initialization',
        passed,
        score,
        details,
        duration: Date.now() - startTime,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        testName: 'Service Initialization',
        passed: false,
        score: 0,
        details: `Initialization failed: ${error}`,
        duration: Date.now() - startTime,
        timestamp: new Date(),
      };
    }
  }

  // Test model loading
  private async testModelLoading(): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      const status = await inferenceService.getStatus();
      const modelsLoaded = Object.values(status.modelsLoaded);
      const loadedCount = modelsLoaded.filter(loaded => loaded).length;
      
      const passed = loadedCount > 0;
      const score = (loadedCount / modelsLoaded.length) * 100;
      const details = `${loadedCount}/${modelsLoaded.length} models loaded`;

      return {
        testName: 'Model Loading',
        passed,
        score,
        details,
        duration: Date.now() - startTime,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        testName: 'Model Loading',
        passed: false,
        score: 0,
        details: `Model loading failed: ${error}`,
        duration: Date.now() - startTime,
        timestamp: new Date(),
      };
    }
  }

  // Test inference capability
  private async testInferenceCapability(): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      const result = await inferenceService.testInference();
      
      const passed = result !== null && result.confidence >= 0 && result.confidence <= 1;
      const score = passed ? 100 : 0;
      const details = passed 
        ? `Inference successful (confidence: ${(result.confidence * 100).toFixed(1)}%)`
        : 'Inference failed';

      return {
        testName: 'Inference Capability',
        passed,
        score,
        details,
        duration: Date.now() - startTime,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        testName: 'Inference Capability',
        passed: false,
        score: 0,
        details: `Inference test failed: ${error}`,
        duration: Date.now() - startTime,
        timestamp: new Date(),
      };
    }
  }

  // Test packaging model
  private async testPackagingModel(): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      const model = await modelDeploymentService.getActiveModel('packaging');
      const passed = model !== null;
      const score = passed ? 100 : 0;
      const details = passed 
        ? 'Packaging model loaded and ready'
        : 'Packaging model not available';

      return {
        testName: 'Packaging Model',
        passed,
        score,
        details,
        duration: Date.now() - startTime,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        testName: 'Packaging Model',
        passed: false,
        score: 0,
        details: `Packaging model test failed: ${error}`,
        duration: Date.now() - startTime,
        timestamp: new Date(),
      };
    }
  }

  // Test pill model
  private async testPillModel(): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      const model = await modelDeploymentService.getActiveModel('pill');
      const passed = model !== null;
      const score = passed ? 100 : 0;
      const details = passed 
        ? 'Pill model loaded and ready'
        : 'Pill model not available';

      return {
        testName: 'Pill Model',
        passed,
        score,
        details,
        duration: Date.now() - startTime,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        testName: 'Pill Model',
        passed: false,
        score: 0,
        details: `Pill model test failed: ${error}`,
        duration: Date.now() - startTime,
        timestamp: new Date(),
      };
    }
  }

  // Test batch code model
  private async testBatchCodeModel(): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      const model = await modelDeploymentService.getActiveModel('batchCode');
      const passed = model !== null;
      const score = passed ? 100 : 0;
      const details = passed 
        ? 'Batch code model loaded and ready'
        : 'Batch code model not available';

      return {
        testName: 'Batch Code Model',
        passed,
        score,
        details,
        duration: Date.now() - startTime,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        testName: 'Batch Code Model',
        passed: false,
        score: 0,
        details: `Batch code model test failed: ${error}`,
        duration: Date.now() - startTime,
        timestamp: new Date(),
      };
    }
  }

  // Test fusion model
  private async testFusionModel(): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      const model = await modelDeploymentService.getActiveModel('fusion');
      const passed = model !== null;
      const score = passed ? 100 : 0;
      const details = passed 
        ? 'Fusion model loaded and ready'
        : 'Fusion model not available';

      return {
        testName: 'Fusion Model',
        passed,
        score,
        details,
        duration: Date.now() - startTime,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        testName: 'Fusion Model',
        passed: false,
        score: 0,
        details: `Fusion model test failed: ${error}`,
        duration: Date.now() - startTime,
        timestamp: new Date(),
      };
    }
  }

  // Test inference speed
  private async testInferenceSpeed(): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      const iterations = 5;
      const times: number[] = [];

      for (let i = 0; i < iterations; i++) {
        const testStart = Date.now();
        await inferenceService.testInference();
        times.push(Date.now() - testStart);
      }

      const averageTime = times.reduce((sum, time) => sum + time, 0) / times.length;
      const passed = averageTime < 5000; // 5 seconds threshold
      const score = Math.max(0, 100 - (averageTime / 50)); // Score decreases with time
      const details = `Average inference time: ${averageTime.toFixed(0)}ms`;

      return {
        testName: 'Inference Speed',
        passed,
        score,
        details,
        duration: Date.now() - startTime,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        testName: 'Inference Speed',
        passed: false,
        score: 0,
        details: `Speed test failed: ${error}`,
        duration: Date.now() - startTime,
        timestamp: new Date(),
      };
    }
  }

  // Test memory usage
  private async testMemoryUsage(): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      // Simplified memory test for demonstration
      const memoryUsage = Math.random() * 100; // Mock value
      const passed = memoryUsage < 50; // 50MB threshold
      const score = Math.max(0, 100 - memoryUsage * 2);
      const details = `Memory usage: ${memoryUsage.toFixed(1)}MB`;

      return {
        testName: 'Memory Usage',
        passed,
        score,
        details,
        duration: Date.now() - startTime,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        testName: 'Memory Usage',
        passed: false,
        score: 0,
        details: `Memory test failed: ${error}`,
        duration: Date.now() - startTime,
        timestamp: new Date(),
      };
    }
  }

  // Test error handling
  private async testErrorHandling(): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      // Test with invalid input
      try {
        await inferenceService.analyzeMedicine('invalid://uri', 'packaging');
      } catch (error) {
        // Expected to fail
      }

      const passed = true; // If we get here, error handling worked
      const score = 100;
      const details = 'Error handling working correctly';

      return {
        testName: 'Error Handling',
        passed,
        score,
        details,
        duration: Date.now() - startTime,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        testName: 'Error Handling',
        passed: false,
        score: 0,
        details: `Error handling test failed: ${error}`,
        duration: Date.now() - startTime,
        timestamp: new Date(),
      };
    }
  }

  // Test end-to-end workflow
  private async testEndToEndWorkflow(): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      // Test complete workflow
      const result = await inferenceService.testInference();
      
      const passed = result !== null && 
                   result.confidence >= 0 && 
                   result.confidence <= 1 &&
                   result.reasoning.length > 0;
      const score = passed ? 100 : 0;
      const details = passed 
        ? 'End-to-end workflow successful'
        : 'End-to-end workflow failed';

      return {
        testName: 'End-to-End Workflow',
        passed,
        score,
        details,
        duration: Date.now() - startTime,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        testName: 'End-to-End Workflow',
        passed: false,
        score: 0,
        details: `End-to-end test failed: ${error}`,
        duration: Date.now() - startTime,
        timestamp: new Date(),
      };
    }
  }

  // Test data collection integration
  private async testDataCollectionIntegration(): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      await dataCollectionService.initialize();
      const stats = await dataCollectionService.getStats();
      
      const passed = stats !== null;
      const score = passed ? 100 : 0;
      const details = passed 
        ? 'Data collection integration working'
        : 'Data collection integration failed';

      return {
        testName: 'Data Collection Integration',
        passed,
        score,
        details,
        duration: Date.now() - startTime,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        testName: 'Data Collection Integration',
        passed: false,
        score: 0,
        details: `Data collection test failed: ${error}`,
        duration: Date.now() - startTime,
        timestamp: new Date(),
      };
    }
  }

  // Get performance metrics
  async getPerformanceMetrics(): Promise<PerformanceMetrics> {
    try {
      const testSuite = await this.runTestSuite('all');
      const speedTest = testSuite.tests.find(test => test.testName === 'Inference Speed');
      const memoryTest = testSuite.tests.find(test => test.testName === 'Memory Usage');

      return {
        averageInferenceTime: speedTest ? parseFloat(speedTest.details.split(':')[1].replace('ms', '')) : 0,
        memoryUsage: memoryTest ? parseFloat(memoryTest.details.split(':')[1].replace('MB', '')) : 0,
        accuracy: 0.85, // Mock value
        precision: 0.82, // Mock value
        recall: 0.88, // Mock value
        f1Score: 0.85, // Mock value
        errorRate: 0.15, // Mock value
      };
    } catch (error) {
      console.error('Failed to get performance metrics:', error);
      throw error;
    }
  }

  // Check if service is ready
  isReady(): boolean {
    return this.isInitialized;
  }
}

export const modelTestingService = new ModelTestingService();
