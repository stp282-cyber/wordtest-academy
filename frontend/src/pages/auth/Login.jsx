import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { User, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
    const { login } = useAuth();
    const navigate = useNavigate();
    const [loginError, setLoginError] = useState('');

    const onSubmit = async (data) => {
        try {
            setLoginError('');
            const user = await login(data.username, data.password);

            // Redirect based on role
            console.log('Frontend Login: User role is:', user.role);
            if (user.role === 'SUPER_ADMIN') {
                navigate('/super-admin');
            } else if (user.role === 'ACADEMY_ADMIN') {
                navigate('/academy-admin');
            } else {
                navigate('/student');
            }
        } catch (error) {
            setLoginError(error.response?.data?.message || 'Login failed. Please check your credentials.');
        }
    };

    return (
        <Card className="w-full border-4 shadow-neo-lg bg-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-secondary to-accent border-b-2 border-black" />

            <div className="text-center mb-8 mt-4">
                <h2 className="text-3xl font-black text-black uppercase tracking-tight">Welcome Back</h2>
                <p className="text-slate-600 font-bold mt-2">Sign in to continue your journey</p>
            </div>

            {loginError && (
                <div className="mb-6 p-4 bg-red-50 border-2 border-red-500 flex items-center text-red-600 font-bold">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    {loginError}
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Input
                    label="Username"
                    icon={User}
                    placeholder="ENTER YOUR USERNAME"
                    error={errors.username?.message}
                    lang="ko"
                    {...register('username', { required: 'Username is required' })}
                />

                <Input
                    label="Password"
                    type="password"
                    icon={Lock}
                    placeholder="ENTER YOUR PASSWORD"
                    error={errors.password?.message}
                    {...register('password', { required: 'Password is required' })}
                />

                <div className="flex items-center justify-between text-sm font-bold">
                    <label className="flex items-center text-black cursor-pointer select-none group">
                        <div className="w-5 h-5 border-2 border-black mr-2 flex items-center justify-center group-hover:bg-slate-100 transition-colors">
                            <input type="checkbox" className="opacity-0 absolute" />
                            <div className="w-3 h-3 bg-black hidden group-has-[:checked]:block" />
                        </div>
                        REMEMBER ME
                    </label>
                    <a href="#" className="text-primary hover:text-black hover:underline decoration-2 underline-offset-2">
                        FORGOT PASSWORD?
                    </a>
                </div>

                <Button
                    type="submit"
                    className="w-full group text-lg"
                    isLoading={isSubmitting}
                >
                    SIGN IN
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
            </form>

            <div className="mt-8 pt-6 border-t-2 border-black text-center text-sm font-bold text-slate-600">
                DON'T HAVE AN ACCOUNT?{' '}
                <Link to="/register" className="text-primary hover:text-black hover:underline decoration-2 underline-offset-2 ml-1">
                    CREATE ACADEMY
                </Link>
            </div>
        </Card>
    );
};

export default Login;
