'use client';

import React, { useState, useEffect } from 'react';
import { Users, Search, Mail, Shield, Calendar, Loader2, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserData {
    id: string;
    name: string;
    email: string;
    role: string;
    type: string;
    status: string;
    photoURL?: string;
    createdAt: string;
}

const ROLE_LABELS: Record<string, string> = {
    'education_student': 'นักเรียน',
    'education_admin': 'ผู้ดูแลระบบ',
    'admin': 'ผู้ดูแลระบบ',
    'student': 'นักเรียน',
    'teacher': 'อาจารย์',
};

const ROLE_COLORS: Record<string, string> = {
    'education_admin': 'bg-purple-100 text-purple-700',
    'admin': 'bg-purple-100 text-purple-700',
    'education_student': 'bg-sky-100 text-sky-700',
    'student': 'bg-sky-100 text-sky-700',
    'teacher': 'bg-emerald-100 text-emerald-700',
};

export default function AdminUsersPage() {
    const [users, setUsers] = useState<UserData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch('/api/education/users');
                if (response.ok) {
                    const data = await response.json();
                    setUsers(data);
                }
            } catch (error) {
                console.error('Error fetching users:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const filteredUsers = users.filter(user => {
        const matchSearch = searchQuery === '' ||
            user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchRole = roleFilter === 'all' || user.role === roleFilter;
        return matchSearch && matchRole;
    });

    const roleOptions = [
        { value: 'all', label: 'ทุก Role' },
        { value: 'education_student', label: 'นักเรียน' },
        { value: 'education_admin', label: 'ผู้ดูแลระบบ' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">ผู้ใช้งาน</h1>
                    <p className="text-slate-500">จัดการข้อมูลสมาชิกและสิทธิ์การใช้งาน</p>
                </div>
                <Badge variant="outline" className="text-base px-4 py-1.5">
                    {filteredUsers.length} คน
                </Badge>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="ค้นหาชื่อ, อีเมล..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="min-w-[140px]">
                            <Shield className="w-4 h-4 mr-2" />
                            {roleOptions.find(r => r.value === roleFilter)?.label}
                            <ChevronDown className="w-4 h-4 ml-2" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        {roleOptions.map(opt => (
                            <DropdownMenuItem key={opt.value} onClick={() => setRoleFilter(opt.value)}>
                                {opt.label}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                {isLoading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="text-center py-16 text-slate-400">
                        <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>{searchQuery ? 'ไม่พบผู้ใช้ที่ค้นหา' : 'ยังไม่มีผู้ใช้งาน'}</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ผู้ใช้งาน</TableHead>
                                <TableHead>อีเมล</TableHead>
                                <TableHead>สิทธิ์</TableHead>
                                <TableHead>ประเภท</TableHead>
                                <TableHead>สถานะ</TableHead>
                                <TableHead>วันที่สมัคร</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredUsers.map(user => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9">
                                                <AvatarImage src={user.photoURL || ''} />
                                                <AvatarFallback className="text-sm bg-slate-100">
                                                    {user.name?.charAt(0) || 'U'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="font-medium text-slate-900">{user.name || 'ไม่ระบุชื่อ'}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-slate-500">
                                        <div className="flex items-center gap-1.5">
                                            <Mail className="w-3.5 h-3.5" />
                                            {user.email}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={`border-0 ${ROLE_COLORS[user.role] || 'bg-slate-100 text-slate-600'}`}>
                                            {ROLE_LABELS[user.role] || user.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-slate-500">
                                        {user.type || '-'}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={user.status === 'active' ? 'default' : 'secondary'}
                                            className={user.status === 'active' ? 'bg-emerald-100 text-emerald-700 border-0' : ''}>
                                            {user.status === 'active' ? 'ใช้งาน' : user.status || '-'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-slate-500 text-sm">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString('th-TH') : '-'}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>
        </div>
    );
}
