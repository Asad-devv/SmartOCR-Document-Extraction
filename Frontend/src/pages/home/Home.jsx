import React from 'react';
import { FileUp, FileCheck, Cloud, Settings2, BrainCircuit, Shield, Zap, Users, BarChart as ChartBar, Workflow, Globe2, Clock, Laptop2, Building2, Award, BookOpen, Headphones, MessageSquare, Star, ChevronRight, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

function FeatureCard({ icon: Icon, title, description }) {
  return (
    <div className="feature-card bg-white p-6 rounded-xl shadow-lg">
      <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
        <Icon className="h-6 w-6 text-[#2067A5]" />
      </div>
      <h3 className="text-xl font-semibold mb-2 text-gray-800">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function StatCard({ icon: Icon, number, label }) {
  return (
    <div className="stat-card bg-white p-6 rounded-xl shadow-lg text-center">
      <div className="flex justify-center mb-4">
        <Icon className="h-8 w-8 text-[#2067A5]" />
      </div>
      <div className="text-4xl font-bold text-[#2067A5] mb-2">{number}</div>
      <div className="text-gray-600">{label}</div>
    </div>
  );
}

function TestimonialCard({ image, name, role, company, quote }) {
  return (
    <div className="testimonial-card bg-white p-6 rounded-xl shadow-lg">
      <div className="flex items-center mb-4">
        <img src={image} alt={name} className="h-12 w-12 rounded-full object-cover mr-4" />
        <div>
          <h4 className="font-semibold text-gray-900">{name}</h4>
          <p className="text-sm text-gray-600">{role} at {company}</p>
        </div>
      </div>
      <p className="text-gray-700 italic">"{quote}"</p>
      <div className="flex text-yellow-400 mt-4">
        <Star className="h-5 w-5 fill-current" />
        <Star className="h-5 w-5 fill-current" />
        <Star className="h-5 w-5 fill-current" />
        <Star className="h-5 w-5 fill-current" />
        <Star className="h-5 w-5 fill-current" />
      </div>
    </div>
  );
}

function App() {
  return (
    <div className="min-h-full pt-20 bg-white">
      {/* Hero Section */}
      <header className="container   mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl h-[46vh] flex flex-col justify-center items-center mx-auto text-center animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Transform Your Documents Into
            <span className="text-[#2067A5]"> Actionable Data</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Advanced OCR platform that makes document processing effortless. Upload, extract, and manage your data with precision.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
           <Link to="/Login"> <button className="hover-scale bg-[#2067A5] text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center">
              Start Free Trial <ArrowRight className="ml-2 h-5 w-5" />
            </button></Link>
            <button className="hover-scale bg-white text-[#2067A5] px-8 py-3 rounded-lg font-semibold border-2 border-[#2067A5] hover:bg-blue-50 transition-colors">
              Schedule Demo
            </button>
          </div>
        </div>
      </header>

      {/* Stats Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatCard icon={CheckCircle2} number="99.9%" label="Accuracy Rate" />
            <StatCard icon={FileCheck} number="10M+" label="Documents Processed" />
            <StatCard icon={Users} number="5000+" label="Active Users" />
            <StatCard icon={Headphones} number="24/7" label="Support Available" />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Powerful Features for Modern Businesses</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <FeatureCard
            icon={FileUp}
            title="Smart Document Upload"
            description="Support for multiple formats including PDFs, images, and scanned documents with intelligent preprocessing."
          />
          <FeatureCard
            icon={Settings2}
            title="Custom Templates"
            description="Create and manage templates for consistent data extraction across similar document types."
          />
          <FeatureCard
            icon={Cloud}
            title="Cloud Integration"
            description="Seamless integration with Google Cloud Document AI and other leading OCR services."
          />
          <FeatureCard
            icon={FileCheck}
            title="Data Verification"
            description="User-friendly interface for reviewing and correcting extracted data with high accuracy."
          />
          <FeatureCard
            icon={BrainCircuit}
            title="AI-Powered Analysis"
            description="Advanced machine learning algorithms for improved accuracy and automated data classification."
          />
          <FeatureCard
            icon={Zap}
            title="Real-time Processing"
            description="Process documents in real-time with immediate results and instant feedback."
          />
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Why Choose DocuProcess?</h2>
            <div className="grid md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div className="flex items-start space-x-4 hover-lift">
                  <div className="flex-shrink-0">
                    <Clock className="h-6 w-6 text-[#2067A5]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Save Time</h3>
                    <p className="text-gray-600">Automate manual data entry and reduce processing time by up to 90%.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4 hover-lift">
                  <div className="flex-shrink-0">
                    <Award className="h-6 w-6 text-[#2067A5]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Improve Accuracy</h3>
                    <p className="text-gray-600">Eliminate human errors with AI-powered data extraction and validation.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4 hover-lift">
                  <div className="flex-shrink-0">
                    <ChartBar className="h-6 w-6 text-[#2067A5]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Scale Operations</h3>
                    <p className="text-gray-600">Process thousands of documents simultaneously without adding headcount.</p>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="flex items-start space-x-4 hover-lift">
                  <div className="flex-shrink-0">
                    <Shield className="h-6 w-6 text-[#2067A5]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Enhanced Security</h3>
                    <p className="text-gray-600">Enterprise-grade security with encryption and compliance standards.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4 hover-lift">
                  <div className="flex-shrink-0">
                    <Workflow className="h-6 w-6 text-[#2067A5]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Streamlined Workflow</h3>
                    <p className="text-gray-600">Integrate with your existing tools and automate end-to-end processes.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4 hover-lift">
                  <div className="flex-shrink-0">
                    <BookOpen className="h-6 w-6 text-[#2067A5]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Easy to Use</h3>
                    <p className="text-gray-600">Intuitive interface requires minimal training to get started.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">How It Works</h2>
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center hover-lift">
              <div className="h-16 w-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileUp className="h-8 w-8 text-[#2067A5]" />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Upload Documents</h3>
              <p className="text-gray-600">Upload your documents in any format - PDFs, images, or scanned files.</p>
            </div>
            <div className="text-center hover-lift">
              <div className="h-16 w-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <BrainCircuit className="h-8 w-8 text-[#2067A5]" />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. AI Processing</h3>
              <p className="text-gray-600">Our AI engine extracts and processes data with high accuracy.</p>
            </div>
            <div className="text-center hover-lift">
              <div className="h-16 w-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <ChartBar className="h-8 w-8 text-[#2067A5]" />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Get Results</h3>
              <p className="text-gray-600">Review and export your processed data in your preferred format.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">What Our Customers Say</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <TestimonialCard
              image="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=128&h=128&fit=crop&auto=format"
              name="Sarah Johnson"
              role="Operations Manager"
              company="TechCorp"
              quote="DocuProcess has transformed our document handling. We've reduced processing time by 85% and improved accuracy significantly."
            />
            <TestimonialCard
              image="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=128&h=128&fit=crop&auto=format"
              name="Michael Chen"
              role="CTO"
              company="DataFlow"
              quote="The AI-powered extraction is incredibly accurate. Integration was smooth, and the support team is exceptional."
            />
            <TestimonialCard
              image="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=128&h=128&fit=crop&auto=format"
              name="Emily Rodriguez"
              role="Finance Director"
              company="GlobalTrade"
              quote="We process thousands of invoices daily with near-perfect accuracy. DocuProcess has been a game-changer for us."
            />
          </div>
        </div>
      </section>

      {/* Integration Section
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Seamless Integration with Your Workflow</h2>
              <p className="text-gray-600 mb-8">Connect with your favorite tools and automate your document processing workflow. Our platform integrates with leading business applications.</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2 integration-icon">
                  <Workflow className="h-5 w-5 text-[#2067A5]" />
                  <span>Zapier</span>
                </div>
                <div className="flex items-center space-x-2 integration-icon">
                  <Globe2 className="h-5 w-5 text-[#2067A5]" />
                  <span>REST API</span>
                </div>
                <div className="flex items-center space-x-2 integration-icon">
                  <Cloud className="h-5 w-5 text-[#2067A5]" />
                  <span>Google Drive</span>
                </div>
                <div className="flex items-center space-x-2 integration-icon">
                  <Laptop2 className="h-5 w-5 text-[#2067A5]" />
                  <span>Custom Apps</span>
                </div>
              </div>
            </div>
            <div className="bg-gray-100 p-8 rounded-xl hover-lift">
              <pre className="text-sm text-gray-800 overflow-x-auto">
                <code>{`// Example API Integration
const docuProcess = require('docuprocess');

async function processDocument(file) {
  const result = await docuProcess.extract({
    file: file,
    template: 'invoice',
    output: 'json'
  });
  
  return result.data;
}`}</code>
              </pre>
            </div>
          </div>
        </div>
      </section> */}

      {/* Security Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Enterprise-Grade Security</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">Your data security is our top priority. We implement industry-leading security measures to protect your sensitive information.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="hover-lift bg-gray-50 p-6 rounded-xl">
                <Shield className="h-8 w-8 text-[#2067A5] mb-4" />
                <h3 className="text-xl font-semibold mb-2">End-to-End Encryption</h3>
                <p className="text-gray-600">All documents and data are encrypted in transit and at rest.</p>
              </div>
              <div className="hover-lift bg-gray-50 p-6 rounded-xl">
                <Building2 className="h-8 w-8 text-[#2067A5] mb-4" />
                <h3 className="text-xl font-semibold mb-2">SOC 2 Compliant</h3>
                <p className="text-gray-600">Certified security controls and procedures to protect your data.</p>
              </div>
              <div className="hover-lift bg-gray-50 p-6 rounded-xl">
                <Users className="h-8 w-8 text-[#2067A5] mb-4" />
                <h3 className="text-xl font-semibold mb-2">Role-Based Access</h3>
                <p className="text-gray-600">Granular access controls and user permission management.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Support Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto bg-gradient-to-r from-[#2067A5] to-blue-700 rounded-2xl p-8 md:p-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="text-white">
              <h2 className="text-3xl font-bold mb-4">24/7 Expert Support</h2>
              <p className="text-blue-100 mb-6">
                Our dedicated support team is always here to help you succeed. Get assistance whenever you need it.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <MessageSquare className="h-5 w-5" />
                  <span>Live chat support</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Headphones className="h-5 w-5" />
                  <span>Phone consultation</span>
                </div>
                <div className="flex items-center space-x-3">
                  <BookOpen className="h-5 w-5" />
                  <span>Extensive documentation</span>
                </div>
              </div>
            </div>
            <div className="text-center">
              <button className="hover-scale bg-white text-[#2067A5] px-8 py-3 rounded-lg font-semibold inline-flex items-center">
                Contact Support <ChevronRight className="ml-2 h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Simple, Transparent Pricing</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="hover-lift bg-white p-8 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Starter</h3>
            <div className="text-4xl font-bold mb-4">$49<span className="text-lg text-gray-600">/mo</span></div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center">
                <Clock className="h-5 w-5 text-[#2067A5] mr-2" />
                <span>1,000 pages/month</span>
              </li>
              {/* <li className="flex items-center">
                <Users className="h-5 w-5 text-[#2067A5] mr-2" />
                <span>5 team members</span>
              </li> */}
              <li className="flex items-center">
                <Cloud className="h-5 w-5 text-[#2067A5] mr-2" />
                <span>Basic integrations</span>
              </li>
            </ul>
            <button className="w-full hover-scale bg-gray-100 text-gray-800 py-2 rounded-lg hover:bg-gray-200 transition-colors">
              Get Started
            </button>
          </div>
          <div className="hover-lift bg-[#2067A5] p-8 rounded-xl shadow-lg text-white transform scale-105">
            <h3 className="text-xl font-semibold mb-4">Professional</h3>
            <div className="text-4xl font-bold mb-4">$149<span className="text-lg opacity-80">/mo</span></div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                <span>5,000 pages/month</span>
              </li>
              {/* <li className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                <span>20 team members</span>
              </li> */}
              <li className="flex items-center">
                <Cloud className="h-5 w-5 mr-2" />
                <span>Advanced integrations</span>
              </li>
            </ul>
            <button className="w-full hover-scale bg-white text-[#2067A5] py-2 rounded-lg hover:bg-blue-50 transition-colors">
              Get Started
            </button>
          </div>
          <div className="hover-lift bg-white p-8 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Enterprise</h3>
            <div className="text-4xl font-bold mb-4">Custom</div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center">
                <Clock className="h-5 w-5 text-[#2067A5] mr-2" />
                <span>Unlimited pages</span>
              </li>
              {/* <li className="flex items-center">
                <Users className="h-5 w-5 text-[#2067A5] mr-2" />
                <span>Unlimited team members</span>
              </li> */}
              <li className="flex items-center">
                <Cloud className="h-5 w-5 text-[#2067A5] mr-2" />
                <span>Custom integrations</span>
              </li>
            </ul>
            <button className="w-full hover-scale bg-gray-100 text-gray-800 py-2 rounded-lg hover:bg-gray-200 transition-colors">
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-8 text-gray-900">Trusted by Industry Leaders</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center opacity-60">
              <img src="https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=128&h=128&fit=crop&auto=format" alt="Company logo" className="h-12 hover-scale" />
              <img src="https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=128&h=128&fit=crop&auto=format" alt="Company logo" className="h-12 hover-scale" />
              <img src="https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=128&h=128&fit=crop&auto=format" alt="Company logo" className="h-12 hover-scale" />
              <img src="https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=128&h=128&fit=crop&auto=format" alt="Company logo" className="h-12 hover-scale" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto bg-[#2067A5] rounded-2xl p-8 md:p-12 text-center text-white hover-lift">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-lg mb-8 text-blue-100">
            Join thousands of businesses that trust our platform for their document processing needs.
          </p>
          <button className="hover-scale bg-white text-[#2067A5] px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors inline-flex items-center">
            Start Your Free Trial <ArrowRight className="ml-2 h-5 w-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white font-semibold mb-4">DocuProcess</h3>
              <p className="text-sm">Advanced document processing platform powered by AI and machine learning.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Enterprise</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-sm text-center">
            <p>&copy; 2024 DocuProcess. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
