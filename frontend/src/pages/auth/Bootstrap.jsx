import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Mail, ArrowRight, AlertCircle, CheckCircle, Building2 } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';
import client from '../../api/client';

const Bootstrap = () => {
    const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
        defaultValues: {
            role: 'ACADEMY_ADMIN'
        }
    });
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const selectedRole = watch('role');

    const onSubmit = async (data) => {
        try {
            setError('');

            if (data.role === 'SUPER_ADMIN') {
                // Create Super Admin
                await client.post('/users/bootstrap', {
                    username: data.username.trim(),
                    password: data.password.trim(),
                    full_name: data.full_name.trim(),
                    email: data.email?.trim()
                });
            } else {
                // Create Academy Admin (creates academy + admin)
                await client.post('/academies/bootstrap', {
                    academyName: data.academy_name.trim(),
                    subdomain: data.subdomain.trim(),
                    adminUsername: data.username.trim(),
                    adminPassword: data.password.trim(),
                    adminName: data.full_name.trim(),
                    adminEmail: data.email?.trim()
                });
            }

            setSuccess(true);
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create account. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center p-4">
            <Card className="w-full max-w-md border-4 shadow-neo-lg bg-white relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 border-b-2 border-black" />

                <div className="text-center mb-8 mt-4">
                    <h2 className="text-3xl font-black text-black uppercase tracking-tight">Create Admin Account</h2>
                    <p className="text-slate-600 font-bold mt-2">Bootstrap your WordTest Academy</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border-2 border-red-500 flex items-center text-red-600 font-bold">
                        <AlertCircle className="w-5 h-5 mr-2" />
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-6 p-4 bg-green-50 border-2 border-green-500 flex items-center text-green-600 font-bold">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Admin created successfully! Redirecting to login...
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Role Selection */}
                    <div>
                        <label className="block text-sm font-black text-black uppercase mb-2">
                            Account Type
                        </label>
                        <select
                            {...register('role', { required: true })}
                            className="w-full px-4 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black font-bold"
                        >
                            <option value="ACADEMY_ADMIN">학원 관리자 (Academy Admin)</option>
                            <option value="SUPER_ADMIN">슈퍼 관리자 (Super Admin)</option>
                        </select>
                    </div>

                    {/* Academy Fields (only for Academy Admin) */}
                    {selectedRole === 'ACADEMY_ADMIN' && (
                        <>
                            <Input
                                label="Academy Name (학원 이름)"
                                icon={Building2}
                                placeholder="예: 이스턴영어공부방"
                                error={errors.academy_name?.message}
                                {...register('academy_name', { required: selectedRole === 'ACADEMY_ADMIN' ? 'Academy name is required' : false })}
                            />
                            <Input
                                label="Subdomain (서브도메인)"
                                icon={Building2}
                                placeholder="예: eastern"
                                error={errors.subdomain?.message}
                                {...register('subdomain', { required: selectedRole === 'ACADEMY_ADMIN' ? 'Subdomain is required' : false })}
                            />
                        </>
                    )}

                    <Input
                        label="Username (아이디)"
                        icon={User}
                        placeholder="ENTER ADMIN USERNAME"
                        error={errors.username?.message}
                        {...register('username', { required: 'Username is required' })}
                    />

                    <Input
                        label="Password (비밀번호)"
                        type="password"
                        icon={Lock}
                        placeholder="ENTER PASSWORD"
                        error={errors.password?.message}
                        {...register('password', { required: 'Password is required' })}
                    />

                    <Input
                        label="Full Name (이름)"
                        icon={User}
                        placeholder="ENTER YOUR NAME"
                        error={errors.full_name?.message}
                        {...register('full_name', { required: 'Full name is required' })}
                    />

                    <Input
                        label="Email (Optional)"
                        type="email"
                        icon={Mail}
                        placeholder="ENTER YOUR EMAIL"
                        error={errors.email?.message}
                        {...register('email')}
                    />

                    <Button
                        type="submit"
                        className="w-full group text-lg"
                        isLoading={isSubmitting}
                        disabled={success}
                    >
                        CREATE {selectedRole === 'SUPER_ADMIN' ? 'SUPER' : 'ACADEMY'} ADMIN
                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </form>

                <div className="mt-8 pt-6 border-t-2 border-black text-center text-sm font-bold text-slate-600">
                    Already have an account?{' '}
                    <a href="/login" className="text-primary hover:text-black hover:underline decoration-2 underline-offset-2 ml-1">
                        SIGN IN
                    </a>
                </div>
            </Card>
        </div>
    );
};

export default Bootstrap;

