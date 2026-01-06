<template>
  <PageLayout
    title="物流中心"
    :actions="[
      { type: 'primary', text: '创建物流单', icon: Plus, onClick: handleCreateShipment },
      { type: 'success', text: '批量发货', icon: Ship, onClick: handleBatchShip },
      { type: 'info', text: '物流商管理', icon: Document, onClick: handleViewCarriers },
      { type: 'warning', text: '异常追踪', icon: Warning, onClick: handleTrackException }
    ]"
  >
    <div class="logistics-center">
    
    <!-- 搜索表单 -->
    <el-card shadow="never" class="search-form">
      <el-form :inline="true" @submit.prevent="handleSearch">
        <el-form-item label="物流单号">
          <el-input
            v-model="searchForm.trackingNo"
            placeholder="请输入物流单号"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        
        <el-form-item label="订单号">
          <el-input
            v-model="searchForm.orderNo"
            placeholder="请输入订单号"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        
        <el-form-item label="物流状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择物流状态"
            clearable
          >
            <el-option label="待发货" value="pending" />
            <el-option label="已发货" value="shipped" />
            <el-option label="运输中" value="in_transit" />
            <el-option label="已签收" value="delivered" />
            <el-option label="异常" value="exception" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="物流商">
          <el-select
            v-model="searchForm.carrier"
            placeholder="请选择物流商"
            clearable
          >
            <el-option label="顺丰速运" value="sf_express" />
            <el-option label="中通快递" value="zhongtong" />
            <el-option label="申通快递" value="shentong" />
            <el-option label="圆通快递" value="yuantong" />
            <el-option label="韵达快递" value="yunda" />
          </el-select>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 物流信息列表 -->
    <el-card shadow="never" class="table-container">
      <el-table :data="logisticsList" stripe style="width: 100%">
        <el-table-column prop="trackingNo" label="物流单号" min-width="180" />
        <el-table-column prop="orderNo" label="订单号" min-width="180" />
        <el-table-column prop="carrier" label="物流商" width="120" align="center">
          <template #default="scope">
            <el-tag type="primary">
              {{ scope.row.carrier === 'sf_express' ? '顺丰速运' : 
                 scope.row.carrier === 'zhongtong' ? '中通快递' : 
                 scope.row.carrier === 'shentong' ? '申通快递' : 
                 scope.row.carrier === 'yuantong' ? '圆通快递' : '韵达快递' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="物流状态" width="120" align="center">
          <template #default="scope">
            <el-tag :type="
              scope.row.status === 'pending' ? 'info' : 
              scope.row.status === 'shipped' ? 'warning' : 
              scope.row.status === 'in_transit' ? 'success' : 
              scope.row.status === 'delivered' ? 'success' : 'danger'
            ">
              {{ 
                scope.row.status === 'pending' ? '待发货' : 
                scope.row.status === 'shipped' ? '已发货' : 
                scope.row.status === 'in_transit' ? '运输中' : 
                scope.row.status === 'delivered' ? '已签收' : '异常'
              }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="recipientName" label="收件人" width="120" />
        <el-table-column prop="recipientPhone" label="联系电话" width="150" />
        <el-table-column prop="recipientAddress" label="收货地址" min-width="200" />
        <el-table-column prop="estimatedDelivery" label="预计送达" width="180" />
        <el-table-column prop="actualDelivery" label="实际送达" width="180" />
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="300" fixed="right" align="center">
          <template #default="scope">
            <div class="table-action-buttons">
              <el-button type="primary" size="small" @click="handleViewTracking(scope.row)" v-permission="'logistics_view'">
                <el-icon><View /></el-icon>
                追踪
              </el-button>
              <el-button type="warning" size="small" @click="handleEditShipment(scope.row)" v-permission="'logistics_edit'">
                <el-icon><Edit /></el-icon>
                编辑
              </el-button>
              <el-button type="info" size="small" @click="handlePrintWaybill(scope.row)" v-permission="'logistics_print'">
                <el-icon><Printer /></el-icon>
                打印
              </el-button>
              <el-button type="danger" size="small" @click="handleCancelShipment(scope.row)" :disabled="scope.row.status !== 'pending'" v-permission="'logistics_cancel'">
                <el-icon><Delete /></el-icon>
                取消
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    
    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>

    <!-- 编辑物流单对话框 -->
    <EditDialog
      v-model="editDialogVisible"
      title="编辑物流单"
      :is-loading="isEditLoading"
      @confirm="confirmEditShipment"
    >
      <el-form :model="editForm" label-width="120px">
        <el-form-item label="物流单号">
          <el-input v-model="editForm.trackingNo" disabled />
        </el-form-item>
        <el-form-item label="订单号">
          <el-input v-model="editForm.orderNo" disabled />
        </el-form-item>
        <el-form-item label="物流商">
          <el-select v-model="editForm.carrier" placeholder="请选择物流商">
            <el-option label="顺丰速运" value="sf_express" />
            <el-option label="中通快递" value="zhongtong" />
            <el-option label="申通快递" value="shentong" />
            <el-option label="圆通快递" value="yuantong" />
            <el-option label="韵达快递" value="yunda" />
          </el-select>
        </el-form-item>
        <el-form-item label="收件人姓名">
          <el-input v-model="editForm.recipientName" placeholder="请输入收件人姓名" />
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input v-model="editForm.recipientPhone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="收货地址">
          <el-input 
            v-model="editForm.recipientAddress" 
            type="textarea" 
            :rows="3"
            placeholder="请输入收货地址" 
          />
        </el-form-item>
        <el-form-item label="物流状态">
          <el-select v-model="editForm.status" placeholder="请选择物流状态">
            <el-option label="待发货" value="pending" />
            <el-option label="已发货" value="shipped" />
            <el-option label="运输中" value="in_transit" />
            <el-option label="已签收" value="delivered" />
            <el-option label="异常" value="exception" />
          </el-select>
        </el-form-item>
        <el-form-item label="预计送达时间">
          <el-date-picker
            v-model="editForm.estimatedDelivery"
            type="datetime"
            placeholder="请选择预计送达时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
      </el-form>
    </EditDialog>

    <!-- 创建物流单对话框 -->
    <el-dialog
      v-model="createDialogVisible"
      title="创建物流单"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="createFormRef"
        :model="createForm"
        :rules="createRules"
        label-width="120px"
      >
        <el-form-item label="订单号" prop="orderNo">
          <el-input 
            v-model="createForm.orderNo" 
            placeholder="请输入订单号" 
            clearable
          />
        </el-form-item>
        <el-form-item label="物流商" prop="carrier">
          <el-select 
            v-model="createForm.carrier" 
            placeholder="请选择物流商" 
            style="width: 100%"
            clearable
          >
            <el-option label="顺丰速运" value="sf_express" />
            <el-option label="中通快递" value="zhongtong" />
            <el-option label="申通快递" value="shentong" />
            <el-option label="圆通快递" value="yuantong" />
            <el-option label="韵达快递" value="yunda" />
          </el-select>
        </el-form-item>
        <el-divider content-position="left">收件人信息</el-divider>
        <el-form-item label="收件人姓名" prop="recipientName">
          <el-input 
            v-model="createForm.recipientName" 
            placeholder="请输入收件人姓名"
            clearable
          />
        </el-form-item>
        <el-form-item label="联系电话" prop="recipientPhone">
          <el-input 
            v-model="createForm.recipientPhone" 
            placeholder="请输入联系电话"
            clearable
          />
        </el-form-item>
        <el-form-item label="收货地址" prop="recipientAddress">
          <el-input 
            v-model="createForm.recipientAddress" 
            type="textarea"
            :rows="3"
            placeholder="请输入收货地址"
          />
        </el-form-item>
        <el-form-item label="预计送达时间">
          <el-date-picker
            v-model="createForm.estimatedDelivery"
            type="datetime"
            placeholder="请选择预计送达时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input 
            v-model="createForm.remark" 
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息（选填）"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="isCreating" @click="confirmCreateShipment">
          创建物流单
        </el-button>
      </template>
    </el-dialog>

    <!-- 批量发货对话框 -->
    <el-dialog
      v-model="batchShipDialogVisible"
      title="批量发货"
      width="900px"
      :close-on-click-modal="false"
    >
      <el-card shadow="never" class="search-form" style="margin-bottom: 16px;">
        <el-form :inline="true" @submit.prevent="handleSearchBatchShipment">
          <el-form-item label="订单号">
            <el-input
              v-model="batchShipSearchForm.orderNo"
              placeholder="请输入订单号"
              clearable
              @keyup.enter="handleSearchBatchShipment"
            />
          </el-form-item>
          <el-form-item label="物流状态">
            <el-select
              v-model="batchShipSearchForm.status"
              placeholder="请选择状态"
              clearable
            >
              <el-option label="待发货" value="pending" />
              <el-option label="已发货" value="shipped" />
              <el-option label="运输中" value="in_transit" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearchBatchShipment">搜索</el-button>
            <el-button @click="handleResetBatchShipSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>
      
      <el-table 
        :data="batchShipmentList" 
        stripe 
        @selection-change="handleBatchSelectionChange"
        style="width: 100%"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="trackingNo" label="物流单号" min-width="180" />
        <el-table-column prop="orderNo" label="订单号" min-width="180" />
        <el-table-column prop="carrier" label="物流商" width="120" align="center">
          <template #default="scope">
            <el-tag type="primary">
              {{ 
                scope.row.carrier === 'sf_express' ? '顺丰速运' : 
                scope.row.carrier === 'zhongtong' ? '中通快递' : 
                scope.row.carrier === 'shentong' ? '申通快递' : 
                scope.row.carrier === 'yuantong' ? '圆通快递' : '韵达快递' 
              }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="recipientName" label="收件人" width="120" />
        <el-table-column prop="recipientPhone" label="联系电话" width="150" />
        <el-table-column prop="status" label="当前状态" width="100" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'pending' ? 'info' : 'warning'">
              {{ scope.row.status === 'pending' ? '待发货' : '已发货' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" />
      </el-table>
      
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="batchShipPagination.page"
          v-model:page-size="batchShipPagination.pageSize"
          :page-sizes="[10, 20, 50]"
          :total="batchShipPagination.total"
          layout="total, sizes, prev, pager, next"
          @size-change="handleBatchSizeChange"
          @current-change="handleBatchPageChange"
        />
      </div>
      
      <template #footer>
        <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
          <span style="color: #909399;">
            已选择 <strong style="color: #409EFF;">{{ selectedBatchShipments.length }}</strong> 个物流单
          </span>
          <div>
            <el-button @click="batchShipDialogVisible = false">取消</el-button>
            <el-button 
              type="primary" 
              :loading="isBatchShipping"
              :disabled="selectedBatchShipments.length === 0"
              @click="handleConfirmBatchShipment"
            >
              确认批量发货 ({{ selectedBatchShipments.length }})
            </el-button>
          </div>
        </div>
      </template>
    </el-dialog>

    <!-- 物流商管理对话框 -->
    <el-dialog
      v-model="carrierDialogVisible"
      title="物流商管理"
      width="1000px"
      :close-on-click-modal="false"
    >
      <div style="margin-bottom: 16px;">
        <el-button type="primary" @click="handleAddCarrier">
          <el-icon><Plus /></el-icon>
          新增物流商
        </el-button>
      </div>
      
      <el-table :data="carrierList" stripe style="width: 100%">
        <el-table-column prop="id" label="编号" width="80" align="center" />
        <el-table-column prop="name" label="物流商名称" width="150" />
        <el-table-column prop="code" label="物流商编码" width="120" />
        <el-table-column prop="contact" label="联系人" width="120" />
        <el-table-column prop="phone" label="联系电话" width="150" />
        <el-table-column prop="serviceArea" label="服务区域" width="150" />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'active' ? 'success' : 'danger'">
              {{ scope.row.status === 'active' ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" @click="handleEditCarrier(scope.row)">
              编辑
            </el-button>
            <el-button 
              type="danger" 
              size="small" 
              @click="handleDeleteCarrier(scope.row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <!-- 物流商表单对话框 -->
    <el-dialog
      v-model="carrierFormDialogVisible"
      :title="isEditingCarrier ? '编辑物流商' : '新增物流商'"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="carrierFormRef"
        :model="carrierForm"
        :rules="carrierRules"
        label-width="120px"
      >
        <el-form-item label="物流商名称" prop="name">
          <el-input 
            v-model="carrierForm.name" 
            placeholder="请输入物流商名称"
            clearable
          />
        </el-form-item>
        <el-form-item label="物流商编码" prop="code">
          <el-input 
            v-model="carrierForm.code" 
            placeholder="请输入物流商编码"
            clearable
            :disabled="isEditingCarrier"
          />
        </el-form-item>
        <el-form-item label="联系人" prop="contact">
          <el-input 
            v-model="carrierForm.contact" 
            placeholder="请输入联系人姓名"
            clearable
          />
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input 
            v-model="carrierForm.phone" 
            placeholder="请输入联系电话"
            clearable
          />
        </el-form-item>
        <el-form-item label="服务区域" prop="serviceArea">
          <el-input 
            v-model="carrierForm.serviceArea" 
            placeholder="请输入服务区域"
            clearable
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch
            v-model="carrierForm.status"
            active-text="启用"
            inactive-text="停用"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="carrierFormDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="isSavingCarrier" @click="confirmSaveCarrier">
          保存
        </el-button>
      </template>
    </el-dialog>

    <!-- 异常追踪对话框 -->
    <el-dialog
      v-model="exceptionDialogVisible"
      title="异常追踪"
      width="1000px"
      :close-on-click-modal="false"
    >
      <el-card shadow="never" class="search-form" style="margin-bottom: 16px;">
        <el-form :inline="true" @submit.prevent="handleSearchException">
          <el-form-item label="物流单号">
            <el-input
              v-model="exceptionSearchForm.trackingNo"
              placeholder="请输入物流单号"
              clearable
              @keyup.enter="handleSearchException"
            />
          </el-form-item>
          <el-form-item label="异常类型">
            <el-select
              v-model="exceptionSearchForm.exceptionType"
              placeholder="请选择异常类型"
              clearable
            >
              <el-option label="延迟配送" value="delay" />
              <el-option label="包裹丢失" value="lost" />
              <el-option label="包裹损坏" value="damaged" />
              <el-option label="签收异常" value="signature" />
              <el-option label="地址错误" value="address" />
              <el-option label="其他异常" value="other" />
            </el-select>
          </el-form-item>
          <el-form-item label="处理状态">
            <el-select
              v-model="exceptionSearchForm.handled"
              placeholder="请选择处理状态"
              clearable
            >
              <el-option label="未处理" value="false" />
              <el-option label="已处理" value="true" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearchException">搜索</el-button>
            <el-button @click="handleResetExceptionSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>
      
      <el-table :data="exceptionList" stripe style="width: 100%">
        <el-table-column prop="trackingNo" label="物流单号" min-width="180" />
        <el-table-column prop="orderNo" label="订单号" min-width="180" />
        <el-table-column prop="exceptionType" label="异常类型" width="120" align="center">
          <template #default="scope">
            <el-tag :type="getExceptionTagType(scope.row.exceptionType)">
              {{ getExceptionTypeText(scope.row.exceptionType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="异常描述" min-width="200" />
        <el-table-column prop="exceptionTime" label="异常发生时间" width="180" />
        <el-table-column prop="handled" label="处理状态" width="100" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.handled ? 'success' : 'danger'">
              {{ scope.row.handled ? '已处理' : '未处理' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="handler" label="处理人" width="120" />
        <el-table-column prop="handleTime" label="处理时间" width="180" />
        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template #default="scope">
            <el-button 
              type="primary" 
              size="small" 
              @click="handleViewExceptionDetail(scope.row)"
            >
              {{ scope.row.handled ? '查看详情' : '处理异常' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="exceptionPagination.page"
          v-model:page-size="exceptionPagination.pageSize"
          :page-sizes="[10, 20, 50]"
          :total="exceptionPagination.total"
          layout="total, sizes, prev, pager, next"
          @size-change="handleExceptionSizeChange"
          @current-change="handleExceptionPageChange"
        />
      </div>
    </el-dialog>

    <!-- 异常处理对话框 -->
    <el-dialog
      v-model="processExceptionDialogVisible"
      title="异常处理"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-descriptions :column="2" border v-if="currentException">
        <el-descriptions-item label="物流单号" :span="2">
          {{ currentException.trackingNo }}
        </el-descriptions-item>
        <el-descriptions-item label="订单号">
          {{ currentException.orderNo }}
        </el-descriptions-item>
        <el-descriptions-item label="异常类型">
          <el-tag :type="getExceptionTagType(currentException.exceptionType)">
            {{ getExceptionTypeText(currentException.exceptionType) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="异常描述" :span="2">
          {{ currentException.description }}
        </el-descriptions-item>
        <el-descriptions-item label="异常发生时间">
          {{ currentException.exceptionTime }}
        </el-descriptions-item>
        <el-descriptions-item label="处理状态">
          <el-tag :type="currentException.handled ? 'success' : 'danger'">
            {{ currentException.handled ? '已处理' : '未处理' }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>
      
      <el-divider />
      
      <el-form :model="processExceptionForm" label-width="120px">
        <el-form-item label="处理方案" required>
          <el-input
            v-model="processExceptionForm.solution"
            type="textarea"
            :rows="4"
            placeholder="请输入处理方案"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="processExceptionDialogVisible = false">取消</el-button>
        <el-button 
          type="primary" 
          :loading="isProcessingException"
          @click="confirmProcessException"
        >
          确认处理
        </el-button>
      </template>
    </el-dialog>
  </PageLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Ship, Document, Warning, View, Edit, Printer, Delete } from '@element-plus/icons-vue'
import PageLayout from '../components/PageLayout.vue'
import EditDialog from '../components/EditDialog.vue'

// 搜索表单数据
const searchForm = ref({
  trackingNo: '',
  orderNo: '',
  status: undefined,
  carrier: undefined
})

// 分页数据
const pagination = ref({
  page: 1,
  pageSize: 10,
  total: 100
})

// 物流信息列表
const logisticsList = ref([
  {
    trackingNo: 'SF1234567890123',
    orderNo: 'O-20251205-001',
    carrier: 'sf_express',
    status: 'delivered',
    recipientName: '张三',
    recipientPhone: '13800138001',
    recipientAddress: '北京市朝阳区某某街道123号',
    estimatedDelivery: '2025-12-05 18:00:00',
    actualDelivery: '2025-12-05 16:30:00',
    createdAt: '2025-12-03 10:00:00'
  },
  {
    trackingNo: 'ZT9876543210987',
    orderNo: 'O-20251205-002',
    carrier: 'zhongtong',
    status: 'in_transit',
    recipientName: '李四',
    recipientPhone: '13800138002',
    recipientAddress: '上海市浦东新区某某街道456号',
    estimatedDelivery: '2025-12-06 18:00:00',
    actualDelivery: null,
    createdAt: '2025-12-04 14:30:00'
  },
  {
    trackingNo: 'ST6543210987654',
    orderNo: 'O-20251205-003',
    carrier: 'shentong',
    status: 'shipped',
    recipientName: '王五',
    recipientPhone: '13800138003',
    recipientAddress: '广州市天河区某某街道789号',
    estimatedDelivery: '2025-12-07 18:00:00',
    actualDelivery: null,
    createdAt: '2025-12-05 09:15:00'
  },
  {
    trackingNo: 'YT3210987654321',
    orderNo: 'O-20251205-004',
    carrier: 'yuantong',
    status: 'pending',
    recipientName: '赵六',
    recipientPhone: '13800138004',
    recipientAddress: '深圳市南山区某某街道321号',
    estimatedDelivery: null,
    actualDelivery: null,
    createdAt: '2025-12-05 11:45:00'
  },
  {
    trackingNo: 'YD4567890123456',
    orderNo: 'O-20251205-005',
    carrier: 'yunda',
    status: 'exception',
    recipientName: '孙七',
    recipientPhone: '13800138005',
    recipientAddress: '杭州市西湖区某某街道654号',
    estimatedDelivery: '2025-12-05 18:00:00',
    actualDelivery: null,
    createdAt: '2025-12-02 16:30:00'
  }
])

// 编辑相关状态
const editDialogVisible = ref(false)
const isEditLoading = ref(false)
const editForm = ref({
  trackingNo: '',
  orderNo: '',
  carrier: '',
  recipientName: '',
  recipientPhone: '',
  recipientAddress: '',
  status: '',
  estimatedDelivery: ''
})

// 搜索
const handleSearch = () => {
  pagination.value.page = 1
  ElMessage.success('搜索完成')
}

// 重置
const handleReset = () => {
  searchForm.value = {
    trackingNo: '',
    orderNo: '',
    status: undefined,
    carrier: undefined
  }
  pagination.value.page = 1
  ElMessage.success('重置完成')
}

// 分页大小变化
const handleSizeChange = (size: number) => {
  pagination.value.pageSize = size
}

// 当前页码变化
const handleCurrentChange = (page: number) => {
  pagination.value.page = page
}

// 异常追踪
const handleTrackException = () => {
  exceptionSearchForm.value = {
    trackingNo: '',
    exceptionType: '',
    handled: ''
  }
  exceptionPagination.value = {
    page: 1,
    pageSize: 10,
    total: 20
  }
  exceptionDialogVisible.value = true
}

// 搜索异常
const handleSearchException = () => {
  exceptionPagination.value.page = 1
  ElMessage.success('搜索完成')
}

// 重置异常搜索
const handleResetExceptionSearch = () => {
  exceptionSearchForm.value = {
    trackingNo: '',
    exceptionType: '',
    handled: ''
  }
  exceptionPagination.value.page = 1
}

// 异常分页大小变化
const handleExceptionSizeChange = (size: number) => {
  exceptionPagination.value.pageSize = size
}

// 异常页码变化
const handleExceptionPageChange = (page: number) => {
  exceptionPagination.value.page = page
}

// 获取异常类型标签颜色
const getExceptionTagType = (type: string): string => {
  const typeMap: Record<string, string> = {
    delay: 'warning',
    lost: 'danger',
    damaged: 'danger',
    signature: 'info',
    address: 'info',
    other: ''
  }
  return typeMap[type] || ''
}

// 获取异常类型文本
const getExceptionTypeText = (type: string): string => {
  const typeMap: Record<string, string> = {
    delay: '延迟配送',
    lost: '包裹丢失',
    damaged: '包裹损坏',
    signature: '签收异常',
    address: '地址错误',
    other: '其他异常'
  }
  return typeMap[type] || type
}

// 查看异常详情/处理异常
const handleViewExceptionDetail = (exception: any) => {
  currentException.value = exception
  processExceptionForm.value.solution = exception.solution || ''
  processExceptionDialogVisible.value = true
}

// 确认处理异常
const confirmProcessException = async () => {
  if (!processExceptionForm.value.solution.trim()) {
    ElMessage.warning('请输入处理方案')
    return
  }

  try {
    isProcessingException.value = true

    const index = exceptionList.value.findIndex(e => e.id === currentException.value.id)
    if (index > -1) {
      exceptionList.value[index] = {
        ...exceptionList.value[index],
        handled: true,
        handleTime: new Date().toLocaleString('zh-CN', { hour12: false }),
        handler: '当前用户',
        solution: processExceptionForm.value.solution
      } as any
    }

    ElMessage.success('异常处理成功')
    processExceptionDialogVisible.value = false
  } catch (error) {
    ElMessage.error(`处理异常失败: ${(error as Error).message}`)
  } finally {
    isProcessingException.value = false
  }
}

// 追踪物流轨迹
const handleViewTracking = (_logistics: any) => {
  ElMessage.info('追踪物流轨迹功能开发中')
}

// 编辑物流单
const handleEditShipment = (logistics: any) => {
  editForm.value = {
    trackingNo: logistics.trackingNo,
    orderNo: logistics.orderNo,
    carrier: logistics.carrier,
    recipientName: logistics.recipientName,
    recipientPhone: logistics.recipientPhone,
    recipientAddress: logistics.recipientAddress,
    status: logistics.status,
    estimatedDelivery: logistics.estimatedDelivery
  }
  editDialogVisible.value = true
}

// 确认编辑物流单
const confirmEditShipment = async () => {
  try {
    isEditLoading.value = true
    
    // 验证表单
    if (!editForm.value.recipientName || !editForm.value.recipientPhone || !editForm.value.recipientAddress) {
      ElMessage.error('请填写完整的收件人信息')
      return
    }
    
    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/
    if (!phoneRegex.test(editForm.value.recipientPhone)) {
      ElMessage.error('请输入正确的手机号码')
      return
    }
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 更新本地数据
    const index = logisticsList.value.findIndex(item => item.trackingNo === editForm.value.trackingNo)
    if (index !== -1 && logisticsList.value[index]) {
      Object.assign(logisticsList.value[index], {
        carrier: editForm.value.carrier,
        recipientName: editForm.value.recipientName,
        recipientPhone: editForm.value.recipientPhone,
        recipientAddress: editForm.value.recipientAddress,
        status: editForm.value.status,
        estimatedDelivery: editForm.value.estimatedDelivery
      })
    }
    
    editDialogVisible.value = false
    ElMessage.success('物流单信息已更新')
  } catch (error) {
    ElMessage.error('更新物流单信息失败')
    console.error('更新物流单失败:', error)
  } finally {
    isEditLoading.value = false
  }
}

// 打印面单
const handlePrintWaybill = (_logistics: any) => {
  ElMessage.info('打印面单功能开发中')
}

// 取消物流单
const handleCancelShipment = async (logistics: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要取消物流单「${logistics.trackingNo}」吗？此操作不可撤销。`,
      '取消物流单确认',
      {
        confirmButtonText: '确定取消',
        cancelButtonText: '保留物流单',
        type: 'warning',
        customClass: 'cancel-task-message-box',
        confirmButtonClass: 'cancel-confirm-btn',
        distinguishCancelAndClose: true,
        autofocus: false,
      }
    )
    
    // 调用取消物流单API
    ElMessage.success('物流单已取消')
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') {
      ElMessage.error('取消物流单失败')
      console.error('取消物流单失败:', error)
    }
  }
}

// 创建物流单相关
const createDialogVisible = ref(false)
const isCreating = ref(false)
const createFormRef = ref()
const createForm = ref({
  orderNo: '',
  carrier: '',
  recipientName: '',
  recipientPhone: '',
  recipientAddress: '',
  estimatedDelivery: '',
  remark: ''
})

const createRules = {
  orderNo: [{ required: true, message: '请输入订单号', trigger: 'blur' }],
  carrier: [{ required: true, message: '请选择物流商', trigger: 'change' }],
  recipientName: [{ required: true, message: '请输入收件人姓名', trigger: 'blur' }],
  recipientPhone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  recipientAddress: [{ required: true, message: '请输入收货地址', trigger: 'blur' }]
}

// 创建物流单
const handleCreateShipment = () => {
  createForm.value = {
    orderNo: '',
    carrier: '',
    recipientName: '',
    recipientPhone: '',
    recipientAddress: '',
    estimatedDelivery: '',
    remark: ''
  }
  createDialogVisible.value = true
}

// 确认创建物流单
const confirmCreateShipment = async () => {
  if (!createFormRef.value) return

  try {
    await createFormRef.value.validate()

    const newShipment = {
      trackingNo: `${createForm.value.carrier.toUpperCase()}${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      orderNo: createForm.value.orderNo,
      carrier: createForm.value.carrier,
      status: 'pending',
      recipientName: createForm.value.recipientName,
      recipientPhone: createForm.value.recipientPhone,
      recipientAddress: createForm.value.recipientAddress,
      estimatedDelivery: createForm.value.estimatedDelivery,
      actualDelivery: null,
      createdAt: new Date().toLocaleString('zh-CN', { hour12: false })
    }

    isCreating.value = true
    await new Promise(resolve => setTimeout(resolve, 1000))

    logisticsList.value.unshift(newShipment as any)
    
    createDialogVisible.value = false
    ElMessage.success('物流单创建成功')
  } catch (error) {
    if (error !== false) {
      ElMessage.error(`创建物流单失败: ${(error as Error).message}`)
    }
  } finally {
    isCreating.value = false
  }
}

// 批量发货相关
const batchShipDialogVisible = ref(false)
const isBatchShipping = ref(false)
const batchShipmentList = ref<any[]>([])
const selectedBatchShipments = ref<any[]>([])
const batchShipSearchForm = ref({
  orderNo: '',
  status: ''
})
const batchShipPagination = ref({
  page: 1,
  pageSize: 10,
  total: 50
})

// 批量发货
const handleBatchShip = async () => {
  batchShipSearchForm.value = {
    orderNo: '',
    status: ''
  }
  batchShipPagination.value = {
    page: 1,
    pageSize: 10,
    total: 50
  }
  selectedBatchShipments.value = []
  
  batchShipmentList.value = logisticsList.value.filter(item => 
    item.status === 'pending' || item.status === 'shipped'
  ).map(item => ({ ...item }))
  
  batchShipDialogVisible.value = true
}

// 搜索批量发货
const handleSearchBatchShipment = () => {
  batchShipPagination.value.page = 1
  ElMessage.success('搜索完成')
}

// 重置批量发货搜索
const handleResetBatchShipSearch = () => {
  batchShipSearchForm.value = {
    orderNo: '',
    status: ''
  }
  batchShipPagination.value.page = 1
}

// 批量发货选择变化
const handleBatchSelectionChange = (selection: any[]) => {
  selectedBatchShipments.value = selection
}

// 批量发货分页大小变化
const handleBatchSizeChange = (size: number) => {
  batchShipPagination.value.pageSize = size
}

// 批量发货页码变化
const handleBatchPageChange = (page: number) => {
  batchShipPagination.value.page = page
}

// 确认批量发货
const handleConfirmBatchShipment = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要批量发货 ${selectedBatchShipments.value.length} 个物流单吗？`,
      '批量发货确认',
      {
        confirmButtonText: '确认发货',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    isBatchShipping.value = true
    await new Promise(resolve => setTimeout(resolve, 1500))

    for (const shipment of selectedBatchShipments.value) {
      if (shipment.status === 'pending') {
        shipment.status = 'shipped'
        const index = logisticsList.value.findIndex(item => item.trackingNo === shipment.trackingNo)
        if (index > -1) {
          const target = logisticsList.value[index]
          if (target) {
            target.status = 'shipped'
          }
        }
      }
    }

    ElMessage.success(`成功发货 ${selectedBatchShipments.value.length} 个物流单`)
    batchShipDialogVisible.value = false
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(`批量发货失败: ${(error as Error).message}`)
    }
  } finally {
    isBatchShipping.value = false
  }
}

// 物流商管理相关
const carrierDialogVisible = ref(false)
const carrierFormDialogVisible = ref(false)
const isEditingCarrier = ref(false)
const isSavingCarrier = ref(false)
const carrierFormRef = ref()
const carrierForm = ref({
  id: 0,
  name: '',
  code: '',
  contact: '',
  phone: '',
  serviceArea: '',
  status: true
})

const carrierRules = {
  name: [{ required: true, message: '请输入物流商名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入物流商编码', trigger: 'blur' }],
  contact: [{ required: true, message: '请输入联系人', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }]
}

const carrierList = ref([
  { id: 1, name: '顺丰速运', code: 'SF', contact: '张先生', phone: '400-811-1111', serviceArea: '全国', status: 'active', createdAt: '2024-01-15 10:30:00' },
  { id: 2, name: '中通快递', code: 'ZTO', contact: '李女士', phone: '400-800-0000', serviceArea: '全国', status: 'active', createdAt: '2024-01-15 10:30:00' },
  { id: 3, name: '圆通速递', code: 'YTO', contact: '王先生', phone: '400-888-8888', serviceArea: '全国', status: 'active', createdAt: '2024-01-15 10:30:00' },
  { id: 4, name: '韵达速递', code: 'YD', contact: '赵女士', phone: '400-821-6789', serviceArea: '全国', status: 'active', createdAt: '2024-01-15 10:30:00' },
  { id: 5, name: '申通快递', code: 'STO', contact: '刘先生', phone: '400-889-8888', serviceArea: '全国', status: 'inactive', createdAt: '2024-01-15 10:30:00' }
])

// 物流商管理
const handleViewCarriers = () => {
  carrierDialogVisible.value = true
}

// 新增物流商
const handleAddCarrier = () => {
  carrierForm.value = {
    id: 0,
    name: '',
    code: '',
    contact: '',
    phone: '',
    serviceArea: '',
    status: true
  }
  isEditingCarrier.value = false
  carrierFormDialogVisible.value = true
}

// 编辑物流商
const handleEditCarrier = (carrier: any) => {
  carrierForm.value = {
    id: carrier.id,
    name: carrier.name,
    code: carrier.code,
    contact: carrier.contact,
    phone: carrier.phone,
    serviceArea: carrier.serviceArea,
    status: carrier.status === 'active'
  }
  isEditingCarrier.value = true
  carrierFormDialogVisible.value = true
}

// 删除物流商
const handleDeleteCarrier = async (carrier: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除物流商"${carrier.name}"吗？`,
      '删除确认',
      {
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const index = carrierList.value.findIndex(c => c.id === carrier.id)
    if (index > -1) {
      carrierList.value.splice(index, 1)
    }

    ElMessage.success('物流商删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(`删除物流商失败: ${(error as Error).message}`)
    }
  }
}

// 保存物流商
const confirmSaveCarrier = async () => {
  if (!carrierFormRef.value) return

  try {
    await carrierFormRef.value.validate()

    if (isEditingCarrier.value) {
      const index = carrierList.value.findIndex(c => c.id === carrierForm.value.id)
      if (index > -1) {
        const currentCarrier = carrierList.value[index]!
        carrierList.value[index] = {
          id: currentCarrier.id,
          name: carrierForm.value.name,
          code: carrierForm.value.code,
          contact: carrierForm.value.contact,
          phone: carrierForm.value.phone,
          serviceArea: carrierForm.value.serviceArea,
          status: carrierForm.value.status ? 'active' : 'inactive',
          createdAt: currentCarrier.createdAt
        } as any
      }
      ElMessage.success('物流商更新成功')
    } else {
      const newCarrier = {
        id: Date.now() as number,
        name: carrierForm.value.name,
        code: carrierForm.value.code,
        contact: carrierForm.value.contact,
        phone: carrierForm.value.phone,
        serviceArea: carrierForm.value.serviceArea,
        status: carrierForm.value.status ? 'active' : 'inactive',
        createdAt: new Date().toLocaleString('zh-CN', { hour12: false })
      }
      carrierList.value.push(newCarrier as any)
      ElMessage.success('物流商添加成功')
    }

    carrierFormDialogVisible.value = false
  } catch (error) {
    if (error !== false) {
      ElMessage.error(`保存物流商失败: ${(error as Error).message}`)
    }
  }
}

// 异常追踪相关
const exceptionDialogVisible = ref(false)
const processExceptionDialogVisible = ref(false)
const isProcessingException = ref(false)
const currentException = ref<any>(null)
const exceptionSearchForm = ref({
  trackingNo: '',
  exceptionType: '',
  handled: ''
})
const exceptionPagination = ref({
  page: 1,
  pageSize: 10,
  total: 20
})

const processExceptionForm = ref({
  solution: ''
})

const exceptionList = ref([
  { 
    id: 1, 
    trackingNo: 'SF1234567890', 
    orderNo: 'O-20251205-001',
    exceptionType: 'delay', 
    description: '包裹在转运中心滞留超过48小时', 
    exceptionTime: '2024-01-20 14:30:00',
    handled: false,
    handleTime: '',
    handler: '',
    solution: ''
  },
  { 
    id: 2, 
    trackingNo: 'ZTO0987654321', 
    orderNo: 'O-20251205-002',
    exceptionType: 'damaged', 
    description: '外包装破损，商品可能受损', 
    exceptionTime: '2024-01-19 09:15:00',
    handled: true,
    handleTime: '2024-01-19 16:00:00',
    handler: '张三',
    solution: '已联系快递公司核实，预计2个工作日内处理完毕'
  },
  { 
    id: 3, 
    trackingNo: 'YT1122334455', 
    orderNo: 'O-20251205-003',
    exceptionType: 'lost', 
    description: '包裹在派送过程中丢失', 
    exceptionTime: '2024-01-18 11:00:00',
    handled: false,
    handleTime: '',
    handler: '',
    solution: ''
  },
  { 
    id: 4, 
    trackingNo: 'YD5566778899', 
    orderNo: 'O-20251205-004',
    exceptionType: 'signature', 
    description: '收件人反映未收到包裹但显示已签收', 
    exceptionTime: '2024-01-17 16:45:00',
    handled: true,
    handleTime: '2024-01-18 10:30:00',
    handler: '李四',
    solution: '核实签收记录，确认是代收点代签，已安排重新派送'
  }
])
</script>

<style scoped>
.logistics-center {
  padding: var(--spacing-xl);
}

.action-bar {
  margin-bottom: var(--spacing-md);
  display: flex;
  gap: var(--spacing-sm);
}/* 搜索表单样式 */
.search-form {
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-lg);
  background-color: var(--bg-primary);
  border-radius: var(--radius-lg);
}

.pagination-container {
  margin-top: var(--spacing-lg);
  display: flex;
  justify-content: flex-end;
}

/* 操作按钮容器 - 现代化设计 */
.table-action-buttons {
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xs);
  min-width: 280px;
  flex-wrap: nowrap;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.table-action-buttons::-webkit-scrollbar {
  display: none;
}

/* 按钮样式优化 */
.table-action-buttons .el-button {
  flex-shrink: 0;
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: var(--font-size-sm);
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.table-action-buttons .el-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.table-action-buttons .el-button:active {
  transform: translateY(0);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

/* 平板设备优化 */
@media (max-width: 1024px) {
  .table-action-buttons {
    gap: var(--spacing-xs);
    min-width: 240px;
  }
  
  .table-action-buttons .el-button {
    padding: var(--spacing-xs);
    font-size: 12px;
  }
  
  .table-action-buttons .el-button .el-icon {
    font-size: 14px;
  }
}

/* 手机设备优化 */
@media (max-width: 768px) {
  .table-action-buttons {
    gap: var(--spacing-xs);
    min-width: 200px;
    flex-wrap: wrap;
    justify-content: flex-start;
  }
  
  .table-action-buttons .el-button {
    min-width: 60px;
    padding: var(--spacing-xs);
    font-size: 11px;
  }
}

/* 超小屏幕设备 */
@media (max-width: 480px) {
  .table-action-buttons {
    min-width: 180px;
    gap: 2px;
  }
  
  .table-action-buttons .el-button {
    min-width: 50px;
    padding: 2px 4px;
    font-size: 10px;
  }
}
</style>